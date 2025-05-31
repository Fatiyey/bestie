// Console script to add RLS policies and test data
// Run this in browser console after logging in

window.setupChatRLSAndData = async function() {
  console.log('🚀 Setting up RLS policies and test data...')
  
  try {
    // Import supabase
    const { supabase } = await import('./src/plugins/supabase.js')
    
    console.log('📡 Supabase client loaded')
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ User not authenticated. Please login first.')
      console.log('💡 To login, go to /login page first')
      return false
    }
    
    console.log('✅ User authenticated:', user.email)
    
    // Create RLS policies using SQL
    console.log('📝 Creating RLS policies...')
    
    const policies = [
      // Contacts policies
      `CREATE POLICY IF NOT EXISTS "Allow authenticated users to read contacts" ON public.contacts
        FOR SELECT USING (auth.role() = 'authenticated');`,
      
      `CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert contacts" ON public.contacts
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,
      
      `CREATE POLICY IF NOT EXISTS "Allow authenticated users to update contacts" ON public.contacts
        FOR UPDATE USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');`,
      
      `CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete contacts" ON public.contacts
        FOR DELETE USING (auth.role() = 'authenticated');`,
      
      // Messages policies
      `CREATE POLICY IF NOT EXISTS "Allow authenticated users to read messages" ON public.messages
        FOR SELECT USING (auth.role() = 'authenticated');`,
      
      `CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert messages" ON public.messages
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,
      
      `CREATE POLICY IF NOT EXISTS "Allow authenticated users to update messages" ON public.messages
        FOR UPDATE USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');`,
      
      `CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete messages" ON public.messages
        FOR DELETE USING (auth.role() = 'authenticated');`
    ]
    
    // Execute each policy
    for (let i = 0; i < policies.length; i++) {
      console.log(`📝 Creating policy ${i + 1}/${policies.length}...`)
      
      const { error: policyError } = await supabase.rpc('exec_sql', {
        query: policies[i]
      })
      
      if (policyError) {
        console.warn(`⚠️ Policy ${i + 1} might already exist or failed:`, policyError.message)
      } else {
        console.log(`✅ Policy ${i + 1} created successfully`)
      }
    }
    
    console.log('✅ RLS policies setup completed')
    
    // Now check if we can read contacts
    console.log('🔍 Testing contact access...')
    
    const { data: existingContacts, error: readError } = await supabase
      .from('contacts')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.error('❌ Still cannot read contacts:', readError)
      console.log('💡 You might need to create the policies manually in Supabase dashboard')
      return false
    }
    
    console.log(`📊 Can read contacts! Found ${existingContacts?.length || 0} existing contacts`)
    
    if (existingContacts && existingContacts.length > 0) {
      console.log('ℹ️ Contacts already exist:', existingContacts)
      return true
    }
    
    // Add test data if no contacts exist
    console.log('📝 Adding test data...')
    
    const testContacts = [
      {
        wa_id: '628123456789',
        name: 'John Doe',
        profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        last_message: 'Hello! How can I help you today?',
        last_message_at: new Date(Date.now() - 3600000).toISOString(),
        welcome_sent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chatbot_state: 'welcome',
        last_interaction: new Date().toISOString(),
        prefer_agent: false
      },
      {
        wa_id: '628987654321',
        name: 'Jane Smith',
        profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        last_message: 'Thank you for the quick response!',
        last_message_at: new Date(Date.now() - 7200000).toISOString(),
        welcome_sent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chatbot_state: 'conversation',
        last_interaction: new Date().toISOString(),
        prefer_agent: true
      },
      {
        wa_id: '628555444333',
        name: 'Mike Johnson',
        profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        last_message: 'I need help with my order',
        last_message_at: new Date(Date.now() - 10800000).toISOString(),
        welcome_sent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chatbot_state: 'support',
        last_interaction: new Date().toISOString(),
        prefer_agent: true
      }
    ]
    
    const { data: insertedContacts, error: insertError } = await supabase
      .from('contacts')
      .insert(testContacts)
      .select()
    
    if (insertError) {
      console.error('❌ Error inserting contacts:', insertError)
      return false
    }
    
    console.log('✅ Test contacts added:', insertedContacts)
    
    // Add test messages
    if (insertedContacts && insertedContacts.length > 0) {
      const testMessages = []
      const currentTime = Date.now()
      
      for (let i = 0; i < insertedContacts.length; i++) {
        const contact = insertedContacts[i]
        const messageTime = currentTime - (i * 3600000)
        
        testMessages.push({
          contact_id: contact.id,
          user_id: null,
          content: contact.last_message,
          type: 'text',
          direction: 'incoming',
          status: 'delivered',
          timestamp: messageTime - 300000,
          status_timestamp: messageTime - 300000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        
        testMessages.push({
          contact_id: contact.id,
          user_id: user.id, // Use actual authenticated user ID
          content: `Thanks for contacting us, ${contact.name}! How can we assist you today?`,
          type: 'text',
          direction: 'outgoing',
          status: 'sent',
          timestamp: messageTime,
          status_timestamp: messageTime,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      const { data: insertedMessages, error: messagesError } = await supabase
        .from('messages')
        .insert(testMessages)
        .select()
      
      if (messagesError) {
        console.error('❌ Error inserting messages:', messagesError)
        return false
      }
      
      console.log('✅ Test messages added:', insertedMessages)
    }
    
    console.log('🎉 Setup completed successfully!')
    console.log('🔄 Now refresh your chat page to see the data')
    
    return true
    
  } catch (error) {
    console.error('❌ Error during setup:', error)
    return false
  }
}

// Simple function to just add RLS policies (if you want to do it separately)
window.addChatRLSPolicies = async function() {
  console.log('📝 Adding RLS policies...')
  
  try {
    const { supabase } = await import('./src/plugins/supabase.js')
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ User not authenticated. Please login first.')
      return false
    }
    
    console.log('✅ User authenticated:', user.email)
    
    // Simple approach: Try to read contacts to test if policies work
    const { data, error } = await supabase
      .from('contacts')
      .select('count(*)', { count: 'exact' })
    
    if (error) {
      console.error('❌ Cannot access contacts table. RLS policies may need to be created manually.')
      console.log('💡 Go to Supabase Dashboard > Authentication > Policies and add policies for contacts and messages tables')
      console.log('💡 Or ask your database admin to run the SQL commands from supabase-rls-policies.sql file')
      return false
    }
    
    console.log('✅ Can access contacts table! RLS policies are working.')
    return true
    
  } catch (error) {
    console.error('❌ Error checking RLS policies:', error)
    return false
  }
}

console.log(`
🎯 Chat RLS and Data Setup Functions Loaded!

First, make sure you're logged in, then run:

1. To setup RLS policies AND add test data:
   setupChatRLSAndData()

2. To just check RLS policies:
   addChatRLSPolicies()

If functions fail, you may need to manually add RLS policies in Supabase Dashboard.
`)

export { }
