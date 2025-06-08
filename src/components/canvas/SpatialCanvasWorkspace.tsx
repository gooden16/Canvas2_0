// Add these imports to your CanvasWorkspace.tsx or SpatialCanvasWorkspace.tsx file:

import { AutomationRuleEditModal } from '../modals/AutomationRuleEditModal';

// Add this state to your component:
const [editingRule, setEditingRule] = useState<string | null>(null);

// Add or replace this connection click handler:
const handleConnectionClick = (connectionId: string) => {
  console.log('🔍 Connection clicked:', connectionId);
  console.log('📋 Available connections:', connections);
  console.log('⚙️ Available automation rules:', automationRules);
  
  const connection = connections.find(c => c.id === connectionId);
  console.log('✅ Found connection:', connection);
  
  if (connection) {
    // Method 1: Check if connection has embedded automation rule
    if (connection.automationRule?.id) {
      console.log('🎯 Using embedded rule:', connection.automationRule.id);
      setEditingRule(connection.automationRule.id);
      return;
    }
    
    // Method 2: Find automation rule by matching connection pattern
    const matchingRule = automationRules.find(rule => {
      // Pattern matching for different rule types
      const connectionPatterns = {
        'auto-replenishment': (c: any) => 
          (c.fromBlock.includes('reserve') && c.toBlock.includes('operating')) ||
          (c.fromBlock.includes('asset') && c.toBlock.includes('asset')),
        'monthly-payment': (c: any) => 
          (c.fromBlock.includes('operating') && c.toBlock.includes('credit')) ||
          (c.fromBlock.includes('asset') && c.toBlock.includes('credit')),
        'collateral-monitoring': (c: any) => 
          (c.fromBlock.includes('credit') && c.toBlock.includes('collateral'))
      };
      
      const pattern = connectionPatterns[rule.id as keyof typeof connectionPatterns];
      return pattern ? pattern(connection) : false;
    });
    
    if (matchingRule) {
      console.log('🎯 Found matching rule:', matchingRule.id);
      setEditingRule(matchingRule.id);
      return;
    }
    
    // Method 3: Create fallback rule based on connection type
    console.log('🔧 Creating fallback rule');
    if ((connection.fromBlock.includes('reserve') && connection.toBlock.includes('operating')) ||
        (connection.fromBlock.includes('asset') && connection.toBlock.includes('asset'))) {
      setEditingRule('auto-replenishment');
    } else if ((connection.fromBlock.includes('operating') && connection.toBlock.includes('credit')) ||
               (connection.fromBlock.includes('asset') && connection.toBlock.includes('credit'))) {
      setEditingRule('monthly-payment');
    } else {
      setEditingRule('auto-replenishment'); // Default fallback
    }
  } else {
    console.log('❌ Connection not found! Opening default rule.');
    setEditingRule('auto-replenishment');
  }
};

// Add this rule save handler:
const handleRuleSave = (ruleId: string, ruleData: any) => {
  console.log('💾 Saving rule:', ruleId, ruleData);
  
  if (onAutomationRuleUpdate) {
    const updatedRules = automationRules.map(rule => 
      rule.id === ruleId ? { ...rule, ...ruleData } : rule
    );
    onAutomationRuleUpdate(updatedRules);
  }
  
  setEditingRule(null);
};

// Make sure your AutomationFlow component has the onConnectionClick prop:
<AutomationFlow 
  connections={connections} 
  blocks={blocks} 
  containerRef={canvasRef} // or whatever your ref is called
  onConnectionClick={handleConnectionClick}
/>

// Add this component at the end of your JSX (before the closing div):
{/* Automation Rule Edit Modal */}
<AutomationRuleEditModal
  ruleId={editingRule}
  isOpen={!!editingRule}
  onClose={() => setEditingRule(null)}
  onSave={handleRuleSave}
/>

// OPTIONAL: Add this temporary test button to verify the function works:
{/* DEBUG: Temporary test button - remove after testing */}
<button 
  onClick={() => handleConnectionClick('test-connection')}
  style={{
    position: 'fixed',
    top: 10,
    right: 10,
    zIndex: 1000,
    background: 'red',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px'
  }}
>
  TEST CONNECTION CLICK
</button>