# WhatsApp Flow Setup Documentation

## Overview
Fitur survey WhatsApp menggunakan WhatsApp Cloud API dan WhatsApp Flow untuk mengirim survei kepuasan interaktif kepada pengunjung yang telah selesai dilayani.

## Prerequisites

1. **WhatsApp Business Account** yang sudah terverifikasi
2. **Meta Developer Account** dan aplikasi WhatsApp Business
3. **Supabase Project** dengan edge functions enabled
4. **WhatsApp Flow** yang sudah dibuat di Meta Business Manager

## Setup Instructions

### 1. Environment Variables

Update file `.env` dengan konfigurasi berikut:

```env
# Supabase Configuration (sudah ada)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# WhatsApp Configuration
VITE_WHATSAPP_EDGE_FUNCTION_URL=https://your-project.supabase.co/functions/v1/whatsapp
VITE_WHATSAPP_SURVEY_FLOW_ID=your-survey-flow-id
VITE_WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your-phone-number-id
```

### 2. Deploy Edge Function

Deploy WhatsApp edge function ke Supabase:

```bash
# Install Supabase CLI jika belum ada
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy edge function
supabase functions deploy whatsapp
```

### 3. Buat WhatsApp Flow

1. Buka **Meta Business Manager**
2. Masuk ke **WhatsApp Manager**
3. Pilih **Flows** dari menu
4. Klik **Create Flow**
5. Pilih template atau buat dari scratch
6. Design flow untuk survey kepuasan dengan screen:
   - Welcome screen
   - Rating questions (1-5 stars)
   - Feedback text input
   - Thank you screen

### 4. Konfigurasi Flow ID

Setelah flow dibuat, dapatkan Flow ID dan update environment variable:

```env
VITE_WHATSAPP_SURVEY_FLOW_ID=your-actual-flow-id
```

### 5. Test Integration

1. Pastikan edge function sudah deploy
2. Update environment variables
3. Test dengan mengirim survey ke nomor WhatsApp test
4. Verifikasi flow berjalan dengan benar

## API Endpoints

Edge function menyediakan endpoint berikut:

### Send Text Message
```
POST /functions/v1/whatsapp/send-text
```

### Launch Flow
```
POST /functions/v1/whatsapp/launch-flow
```

## Flow Structure

Contoh struktur data yang dikirim ke flow:

```json
{
  "visitor_name": "John Doe",
  "visit_date": "28 Mei 2025", 
  "service_type": "Pelayanan Statistik Terpadu"
}
```

## Error Handling

Sistem menggunakan fallback mechanism:

1. **Primary**: WhatsApp Flow untuk survey interaktif
2. **Fallback**: Pesan teks WhatsApp dengan link survey
3. **Future**: Email dan SMS sebagai alternatif

## Troubleshooting

### Common Issues

1. **Edge function timeout**: Pastikan Supabase project memiliki resource yang cukup
2. **WhatsApp API quota**: Cek quota dan billing di Meta Business Manager
3. **Flow tidak muncul**: Verifikasi Flow ID dan publish status
4. **Authentication error**: Cek access token dan permissions

### Logs

Check logs di:
- Supabase Dashboard > Edge Functions > Logs
- Browser Developer Console
- WhatsApp Manager > API Logs

## Security Notes

- Jangan expose access token di client side
- Gunakan Supabase edge function untuk secure API calls
- Validate user input sebelum mengirim ke WhatsApp API
- Monitor usage untuk menghindari spam

## Monitoring

Pantau metrik berikut:
- Survey delivery rate
- Flow completion rate
- API error rate
- User engagement

## Future Enhancements

- [ ] Email survey integration
- [ ] SMS survey integration
- [ ] Survey analytics dashboard
- [ ] Multi-language support
- [ ] Advanced flow templates
