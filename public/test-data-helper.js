// Test data helper functions
// You can run these functions in browser console to add/clear test data

window.insertSurveyData = async function() {
  console.log('🔄 Inserting test survey data...')
  
  try {
    const { supabase } = await import('../src/plugins/supabase.js')
    
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

    // Survey test data insertion
    try {
      // 1. Add srv_tipe_periode data
      const testTipePeriode = [
        {
          id: 1,
          nama_tipe: 'Bulanan'
        },
        {
          id: 2,
          nama_tipe: 'Triwulanan'
        }
      ]

      const { data: tipePeriodeData, error: tipePeriodeError } = await supabase
        .from('srv_tipe_periode')
        .upsert(testTipePeriode)
        .select()
      
      if (tipePeriodeError) {
        console.error('❌ Error adding tipe periode:', tipePeriodeError)
        return false
      }
      console.log('✅ Added tipe periode data:', tipePeriodeData)

      // 2. Add srv_survei data
      const testSurvei = [
        {
          id: 1,
          nama: 'Survei Ekonomi',
          tipe_periode: 1, // Bulanan
          is_parent: true,
          parent_survei_id: null
        },
        {
          id: 2,
          nama: 'Sub-survei Ekonomi A',
          tipe_periode: 1,
          is_parent: false,
          parent_survei_id: 1
        }
      ]

      const { data: surveiData, error: surveiError } = await supabase
        .from('srv_survei')
        .upsert(testSurvei)
        .select()
      
      if (surveiError) {
        console.error('❌ Error adding survei:', surveiError)
        return false
      }
      console.log('✅ Added survei data:', surveiData)

      // 3. Add srv_survei_rinci data
      const testSurveiRinci = [
        {
          id: 1,
          nama: 'Pengumpulan Data',
          survei_id: 2 // Connected to Sub-survei Ekonomi A
        }
      ]

      const { data: surveiRinciData, error: surveiRinciError } = await supabase
        .from('srv_survei_rinci')
        .upsert(testSurveiRinci)
        .select()
      
      if (surveiRinciError) {
        console.error('❌ Error adding survei rinci:', surveiRinciError)
        return false
      }
      console.log('✅ Added survei rinci data:', surveiRinciData)

      // 4. Add srv_kegiatan data
      const testKegiatan = [
        {
          id: 1,
          kegiatan_id: 1, // Connected to srv_survei_rinci id 1
          jabatan: 'Ketua Tim',
          jenis_pekerjaan: 'Koordinasi Tim Lapangan',
          satuan: 'Kegiatan',
          honor: 1000000,
          is_active: true
        }
      ]

      const { data: kegiatanData, error: kegiatanError } = await supabase
        .from('srv_kegiatan')
        .upsert(testKegiatan)
        .select()
      
      if (kegiatanError) {
        console.error('❌ Error adding kegiatan:', kegiatanError)
        return false
      }
      console.log('✅ Added kegiatan data:', kegiatanData)

      console.log('✅ All test data inserted successfully!')
      return true
    } catch (error) {
      console.error('❌ Error inserting test data:', error)
      return false
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

// Function to clear all test data
window.clearSurveyData = async function() {
  console.log('🔄 Clearing survey test data...')
  
  try {
    const { supabase } = await import('../src/plugins/supabase.js')

    // Delete in reverse order of dependencies
    const tables = ['srv_kegiatan', 'srv_survei_rinci', 'srv_survei', 'srv_tipe_periode']
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', 0) // Delete all records
      
      if (error) {
        console.error(`❌ Error clearing ${table}:`, error)
        return false
      }
      console.log(`✅ Cleared ${table} data`)
    }

    console.log('✅ All test data cleared successfully!')
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
