// Database debug functions
// Run these in browser console to debug database connection and structure

window.checkDatabaseConnection = async function() {
  console.log('🔍 Checking database connection...')
  
  try {
    const { supabase } = await import('./src/plugins/supabase.js')
    
    // Test basic connection
    const { data, error } = await supabase.from('contacts').select('count', { count: 'exact' })
    
    if (error) {
      console.error('❌ Database connection error:', error)
      return false
    }
    
    console.log('✅ Database connection successful!')
    console.log(`📊 Current contacts count: ${data[0]?.count || 0}`)
    return true
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
    return false
  }
}

window.checkTablesStructure = async function() {
  console.log('🔍 Checking database tables structure...')
  
  try {
    const { supabase } = await import('./src/plugins/supabase.js')
    
    // Check contacts table
    console.log('📊 Checking contacts table...')
    const { data: contactsSample, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1)
    
    if (contactsError && !contactsError.message.includes('relation "contacts" does not exist')) {
      console.error('❌ Contacts table error:', contactsError)
    } else if (contactsError && contactsError.message.includes('relation "contacts" does not exist')) {
      console.error('❌ Contacts table does not exist!')
      return false
    } else {
      console.log('✅ Contacts table exists')
      if (contactsSample && contactsSample.length > 0) {
        console.log('📋 Contacts table structure sample:', contactsSample[0])
      } else {
        console.log('📋 Contacts table is empty')
      }
    }
    
    // Check messages table
    console.log('📊 Checking messages table...')
    const { data: messagesSample, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1)
    
    if (messagesError && !messagesError.message.includes('relation "messages" does not exist')) {
      console.error('❌ Messages table error:', messagesError)
    } else if (messagesError && messagesError.message.includes('relation "messages" does not exist')) {
      console.error('❌ Messages table does not exist!')
      return false
    } else {
      console.log('✅ Messages table exists')
      if (messagesSample && messagesSample.length > 0) {
        console.log('📋 Messages table structure sample:', messagesSample[0])
      } else {
        console.log('📋 Messages table is empty')
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error checking tables:', error)
    return false
  }
}

window.getAllTableData = async function() {
  console.log('🔍 Getting all table data...')
  
  try {
    const { supabase } = await import('./src/plugins/supabase.js')
    
    // Get all contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (contactsError) {
      console.error('❌ Error getting contacts:', contactsError)
    } else {
      console.log(`📊 All contacts (${contacts?.length || 0} total):`, contacts)
    }
    
    // Get all messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (messagesError) {
      console.error('❌ Error getting messages:', messagesError)
    } else {
      console.log(`📨 All messages (${messages?.length || 0} total):`, messages)
    }
    
    return { contacts, messages }
    
  } catch (error) {
    console.error('❌ Error getting table data:', error)
    return null
  }
}

window.testChatService = async function() {
  console.log('🧪 Testing ChatService functions...')
  
  try {
    // Import ChatService
    const { ChatService } = await import('./src/features/chat/services/chatService.js')
    
    console.log('📞 Testing ChatService.getContacts()...')
    const contacts = await ChatService.getContacts()
    console.log('📊 ChatService.getContacts() result:', contacts)
    
    if (contacts && contacts.length > 0) {
      const firstContactId = contacts[0].id
      console.log(`📞 Testing ChatService.getContactMessages() for contact: ${firstContactId}...`)
      const messages = await ChatService.getContactMessages(firstContactId)
      console.log(`📨 ChatService.getContactMessages() result for ${firstContactId}:`, messages)
      
      console.log(`📞 Testing ChatService.getContactById() for contact: ${firstContactId}...`)
      const contact = await ChatService.getContactById(firstContactId)
      console.log(`👤 ChatService.getContactById() result for ${firstContactId}:`, contact)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error testing ChatService:', error)
    return false
  }
}

console.log(`
🧪 Database debug functions loaded!

Available functions:
  checkDatabaseConnection() - Test basic database connection
  checkTablesStructure() - Check if tables exist and their structure
  getAllTableData() - Get all data from contacts and messages tables
  testChatService() - Test ChatService functions

Example usage:
  await checkDatabaseConnection()
  await checkTablesStructure()
  await getAllTableData()
  await testChatService()
`)
