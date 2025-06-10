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

window.addTestSurveyData = async function() {
  console.log('🚀 Starting to add test survey data...')
  
  try {
    const { supabase } = await import('./src/plugins/supabase.js')
    
    // First add tipe periode
    const testTipePeriode = [
      { id: 1, nama_tipe: 'Harian' },
      { id: 2, nama_tipe: 'Mingguan' },
      { id: 3, nama_tipe: 'Bulanan' }
    ]
    
    console.log('📝 Adding test tipe periode data...')
    const { data: tipePeriodeData, error: tipePeriodeError } = await supabase
      .from('srv_tipe_periode')
      .upsert(testTipePeriode)
      .select()
    
    if (tipePeriodeError) {
      console.error('❌ Error adding tipe periode:', tipePeriodeError)
      return false
    }
    
    console.log('✅ Added tipe periode data:', tipePeriodeData)
    
    // Add parent survei
    const testSurvei = [
      {
        id: 1,
        nama: 'Survei Kepuasan Layanan',
        tipe_periode: 1, // Harian
        is_parent: true,
        parent_survei_id: null
      },
      {
        id: 2,
        nama: 'Survei Kinerja Pegawai',
        tipe_periode: 3, // Bulanan
        is_parent: true,
        parent_survei_id: null
      }
    ]
    
    console.log('📝 Adding test survei data...')
    const { data: surveiData, error: surveiError } = await supabase
      .from('srv_survei')
      .upsert(testSurvei)
      .select()
    
    if (surveiError) {
      console.error('❌ Error adding survei:', surveiError)
      return false
    }
    
    console.log('✅ Added survei data:', surveiData)
    
    // Add survei rinci
    const testSurveiRinci = [
      {
        id: 1,
        nama: 'Layanan Informasi',
        survei_id: 1 // Child of Survei Kepuasan Layanan
      },
      {
        id: 2,
        nama: 'Layanan Pengaduan',
        survei_id: 1 // Child of Survei Kepuasan Layanan
      },
      {
        id: 3,
        nama: 'Kinerja Bulan Ini',
        survei_id: 2 // Child of Survei Kinerja Pegawai
      }
    ]
    
    console.log('📝 Adding test survei rinci data...')
    const { data: surveiRinciData, error: surveiRinciError } = await supabase
      .from('srv_survei_rinci')
      .upsert(testSurveiRinci)
      .select()
    
    if (surveiRinciError) {
      console.error('❌ Error adding survei rinci:', surveiRinciError)
      return false
    }
    
    console.log('✅ Added survei rinci data:', surveiRinciData)
      // Add kegiatan
    const testKegiatan = [
      {
        id: 1,
        kegiatan_id: 1,
        jabatan: 'Ketua Tim',
        jenis_pekerjaan: 'Koordinasi Tim',
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
    return true
  } catch (error) {
    console.error('❌ Error in addTestData:', error)
    return false
  }
}