// Test data console function
// You can run this in browser console to add test data

window.addTestChatData = async function() {
  console.log('🚀 Starting to add test chat data...')
  
  try {
    // Import supabase from your app (adjust the import path as needed)
    const { supabase } = await import('./src/plugins/supabase.js')
    
    console.log('📡 Supabase client loaded successfully')
    
    // Check if contacts already exist
    const { data: existingContacts, error: checkError } = await supabase
      .from('contacts')
      .select('*')
      .limit(5)
    
    if (checkError) {
      console.error('❌ Error checking existing contacts:', checkError)
      return false
    }
    
    console.log(`📊 Found ${existingContacts?.length || 0} existing contacts`)
    
    if (existingContacts && existingContacts.length > 0) {
      console.log('ℹ️ Contacts already exist:', existingContacts)
      return true
    }

    // Sample contacts data
    const testContacts = [
      {
        wa_id: '628123456789',
        name: 'John Doe',
        profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        last_message: 'Hello! How can I help you today?',
        last_message_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
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
        last_message_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
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
        last_message_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        welcome_sent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chatbot_state: 'support',
        last_interaction: new Date().toISOString(),
        prefer_agent: true
      },
      {
        wa_id: '628111222333',
        name: 'Sarah Wilson',
        profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        last_message: 'Good morning! Can you tell me about your services?',
        last_message_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        welcome_sent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chatbot_state: 'inquiry',
        last_interaction: new Date().toISOString(),
        prefer_agent: false
      },
      {
        wa_id: '628777888999',
        name: 'David Brown',
        profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        last_message: 'Is the support team available?',
        last_message_at: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
        welcome_sent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chatbot_state: 'support_request',
        last_interaction: new Date().toISOString(),
        prefer_agent: true
      }
    ]

    console.log('📝 Inserting test contacts...', testContacts)

    // Insert contacts
    const { data: insertedContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(testContacts)
      .select()

    if (contactsError) {
      console.error('❌ Error inserting contacts:', contactsError)
      return false
    }

    console.log('✅ Successfully inserted contacts:', insertedContacts)

    // Now add some sample messages for each contact
    if (insertedContacts && insertedContacts.length > 0) {
      const testMessages = []
      const currentTime = Date.now()

      // Add messages for each contact
      for (let i = 0; i < insertedContacts.length; i++) {
        const contact = insertedContacts[i]
        const messageTime = currentTime - (i * 3600000) // Spread messages over time

        // Add incoming message
        testMessages.push({
          contact_id: contact.id,
          user_id: null,
          content: contact.last_message,
          type: 'text',
          direction: 'incoming',
          status: 'delivered',
          timestamp: messageTime - 300000, // 5 minutes before
          status_timestamp: messageTime - 300000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

        // Add outgoing response
        testMessages.push({
          contact_id: contact.id,
          user_id: 'admin-user', // You might need to adjust this based on your users table
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

      console.log('📝 Inserting test messages...', testMessages)

      const { data: insertedMessages, error: messagesError } = await supabase
        .from('messages')
        .insert(testMessages)
        .select()

      if (messagesError) {
        console.error('❌ Error inserting messages:', messagesError)
        return false
      }

      console.log('✅ Successfully inserted messages:', insertedMessages)
    }

    console.log('🎉 Test data setup completed successfully!')
    return true

  } catch (error) {
    console.error('❌ Error adding test contacts:', error)
    return false
  }
}

// Also add a function to clear test data
window.clearTestChatData = async function() {
  console.log('🧹 Clearing test chat data...')
  
  try {
    const { supabase } = await import('./src/plugins/supabase.js')
    
    // Delete all messages first (due to foreign key constraints)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .neq('id', 'impossible-id') // This will delete all records
    
    if (messagesError) {
      console.error('❌ Error deleting messages:', messagesError)
      return false
    }
    
    console.log('✅ Messages cleared')
    
    // Then delete all contacts
    const { error: contactsError } = await supabase
      .from('contacts')
      .delete()
      .neq('id', 'impossible-id') // This will delete all records
    
    if (contactsError) {
      console.error('❌ Error deleting contacts:', contactsError)
      return false
    }
    
    console.log('✅ Contacts cleared')
    console.log('🎉 Test data cleared successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error)
    return false
  }
}

console.log(`
🎯 Test data functions loaded!

To add test data, run:
  addTestChatData()

To clear test data, run:
  clearTestChatData()

To check current data, run:
  import('./src/plugins/supabase.js').then(({supabase}) => {
    supabase.from('contacts').select('*').then(({data}) => console.log('Contacts:', data))
    supabase.from('messages').select('*').then(({data}) => console.log('Messages:', data))
  })
`)
