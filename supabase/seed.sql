-- Seed data for testing (optional)

-- Note: This is sample data for development/testing purposes
-- In production, users will be created through the auth system

-- Sample WhatsApp message templates
INSERT INTO public.whatsapp_templates (template_name, template_message, user_id) VALUES
  ('تأكيد التسجيل', 'مرحباً {{student_name}}!\n\nتم استلام طلب تسجيلك في ورشة "{{workshop_title}}" بنجاح.\n\nسيتم مراجعة طلبك وإشعارك بالقرار قريباً.\n\nشكراً لك!', (SELECT id FROM auth.users LIMIT 1)),
  ('قبول الطالب', 'مبروك {{student_name}}! 🎉\n\nتم قبولك في ورشة "{{workshop_title}}".\n\nموعد الورشة: {{workshop_date}}\n\nنتطلع لرؤيتك!', (SELECT id FROM auth.users LIMIT 1)),
  ('رفض الطالب', 'عزيزي {{student_name}},\n\nنعتذر عن عدم قبولك في ورشة "{{workshop_title}}" في الوقت الحالي.\n\nنتمنى لك التوفيق!', (SELECT id FROM auth.users LIMIT 1)),
  ('إرسال الشهادة', 'مبروك {{student_name}}! 🎓\n\nيمكنك الآن الحصول على شهادتك من ورشة "{{workshop_title}}".\n\nرابط الشهادة:\n{{certificate_url}}\n\nشكراً لحضورك!', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Instructions for manual setup:
-- 1. Create a Supabase project at https://supabase.com
-- 2. Run the migration file (001_initial_schema.sql) in the SQL editor
-- 3. Get your API keys from Project Settings > API
-- 4. Update your .env.local file with the keys
-- 5. Enable Email Auth in Authentication > Providers
-- 6. (Optional) Enable Phone Auth for WhatsApp number verification

