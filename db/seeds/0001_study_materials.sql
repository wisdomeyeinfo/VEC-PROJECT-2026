-- Seed study materials
begin;

insert into public.study_materials (title, description, type, url, thumbnail_url, language, category)
values 
('The Path of Truth', 'Discover the power of honesty through this amazing illustrated storybook.', 'book', '#', '/assets/book_thumb.png', 'en', 'Stories'),
('Character & Conduct', 'A special video guide on how to be a champion of good character.', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '/assets/video_thumb.png', 'en', 'Values'),
('सत्य की राह', 'ईमानदारी की शक्ति के बारे में एक अद्भुत सचित्र कहानी।', 'book', '#', '/assets/book_thumb.png', 'hi', 'Stories'),
('चारित्र्य आणि आचरण', 'उत्तम चारित्र्यवान कसे बनावे यावरील विशेष व्हिडिओ मार्गदर्शक।', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '/assets/video_thumb.png', 'mr', 'Values');

commit;
