INSERT INTO users (id, phone, email, password_hash, full_name, role, preferred_locale)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '9000000001', 'admin@nirmal.health',
   '$2a$12$f4cfgG0yteu6GH6qM/llC.CFNBTkWDf5VGo7xHHYOA2w6wHUCYQA2', 'Nirmal Admin', 'admin', 'en'),
  ('a0000000-0000-0000-0000-000000000002', '9000000002', 'caregiver@nirmal.health',
   '$2a$12$f4cfgG0yteu6GH6qM/llC.CFNBTkWDf5VGo7xHHYOA2w6wHUCYQA2', 'Priya Borah', 'caregiver', 'as'),
  ('a0000000-0000-0000-0000-000000000003', '9000000003', 'asha@nirmal.health',
   '$2a$12$f4cfgG0yteu6GH6qM/llC.CFNBTkWDf5VGo7xHHYOA2w6wHUCYQA2', 'Monica Das', 'health_worker', 'as')
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (id, display_name, birth_year, sex, preferred_locale, village, block, district, state, dementia_stage, created_by)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Hemlata Borah', 1948, 'F', 'as', 'Majuli', 'Majuli', 'Jorhat', 'Assam', 'moderate', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000002', 'Ramesh Das', 1942, 'M', 'en', 'Shillong', 'Shillong', 'East Khasi Hills', 'Meghalaya', 'mild', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000003', 'Savitri Devi', 1950, 'F', 'hi', 'Imphal', 'Imphal West', 'Imphal West', 'Manipur', 'at_risk', 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO care_relationships (user_id, patient_id, relationship, can_edit_care_plan, granted_by)
VALUES
  ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'primary_caregiver', true, 'a0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'primary_caregiver', true, 'a0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'asha', false, 'a0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'asha', false, 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

INSERT INTO games (slug, title, description, domains, level_count, config, supports_voice, icon_key, sort_order)
VALUES
  ('memory-match', 'Memory Match', 'NER-themed card pairs', ARRAY['memory', 'visuospatial']::cognitive_domain[], 5, '{"levels": [{"difficulty": 20, "grid": "2x2"}, {"difficulty": 30, "grid": "3x2"}, {"difficulty": 45, "grid": "3x3"}, {"difficulty": 60, "grid": "4x3"}, {"difficulty": 75, "grid": "4x4"}]}', true, 'memory-match', 1),
  ('daily-routine', 'Daily Routine Recall', 'Order the steps of a day', ARRAY['memory', 'executive']::cognitive_domain[], 5, '{"levels": [{"difficulty": 15, "steps": 3}, {"difficulty": 25, "steps": 4}, {"difficulty": 40, "steps": 5}, {"difficulty": 55, "steps": 6}, {"difficulty": 70, "steps": 8}]}', true, 'daily-routine', 2),
  ('story-sequencing', 'Story Sequencing', 'Order panels of a folk tale', ARRAY['memory', 'language', 'executive']::cognitive_domain[], 4, '{"levels": [{"difficulty": 20, "panels": 3}, {"difficulty": 40, "panels": 4}, {"difficulty": 60, "panels": 5}, {"difficulty": 80, "panels": 6}]}', true, 'story-seq', 3),
  ('pattern-complete', 'Pattern Complete', 'What comes next in the weave', ARRAY['visuospatial', 'executive']::cognitive_domain[], 4, '{"levels": [{"difficulty": 25}, {"difficulty": 45}, {"difficulty": 65}, {"difficulty": 85}]}', false, 'pattern', 4),
  ('odd-one-out', 'Odd One Out', 'Which one does not belong', ARRAY['executive', 'language']::cognitive_domain[], 4, '{"levels": [{"difficulty": 20}, {"difficulty": 40}, {"difficulty": 60}, {"difficulty": 80}]}', true, 'odd-one', 5),
  ('face-name-recall', 'Face and Name Recall', 'Family photographs from Memory Vault', ARRAY['memory']::cognitive_domain[], 3, '{"levels": [{"difficulty": 30, "pairs": 2}, {"difficulty": 50, "pairs": 3}, {"difficulty": 70, "pairs": 4}]}', true, 'face-name', 6),
  ('memory-lane', 'Memory Lane', 'Reminiscence — unscored', ARRAY['memory']::cognitive_domain[], 1, '{"levels": [{"difficulty": 0}]}', true, 'memory-lane', 7),
  ('chimp-test', 'Chimp Test', 'Working memory span', ARRAY['memory']::cognitive_domain[], 5, '{"levels": [{"difficulty": 20, "span": 2}, {"difficulty": 35, "span": 3}, {"difficulty": 50, "span": 4}, {"difficulty": 65, "span": 5}, {"difficulty": 80, "span": 6}]}', false, 'chimp', 8),
  ('sequence-memory', 'Sequence Memory', 'Simon-style light and sound', ARRAY['memory']::cognitive_domain[], 5, '{"levels": [{"difficulty": 20, "span": 2}, {"difficulty": 35, "span": 3}, {"difficulty": 50, "span": 4}, {"difficulty": 65, "span": 5}, {"difficulty": 80, "span": 6}]}', false, 'sequence', 9),
  ('number-memory', 'Number Memory', 'Digit span recall', ARRAY['memory']::cognitive_domain[], 5, '{"levels": [{"difficulty": 20, "digits": 2}, {"difficulty": 35, "digits": 3}, {"difficulty": 50, "digits": 4}, {"difficulty": 65, "digits": 5}, {"difficulty": 80, "digits": 6}]}', false, 'number', 10),
  ('word-recall', 'Word Recall', 'Recognition memory', ARRAY['memory']::cognitive_domain[], 4, '{"levels": [{"difficulty": 25, "words": 5}, {"difficulty": 45, "words": 7}, {"difficulty": 65, "words": 9}, {"difficulty": 85, "words": 12}]}', true, 'word', 11),
  ('reaction-time', 'Reaction Time', 'Simple RT measurement', ARRAY['processing_speed']::cognitive_domain[], 4, '{"levels": [{"difficulty": 20, "trials": 5}, {"difficulty": 40, "trials": 8}, {"difficulty": 60, "trials": 10}, {"difficulty": 80, "trials": 12}]}', false, 'reaction', 12),
  ('find-object', 'Find the Object', 'Spot the japi in a market scene', ARRAY['attention']::cognitive_domain[], 4, '{"levels": [{"difficulty": 25}, {"difficulty": 45}, {"difficulty": 65}, {"difficulty": 85}]}', false, 'find-obj', 13),
  ('sound-recognition', 'Sound Recognition', 'Name the instrument or bird call', ARRAY['attention', 'language']::cognitive_domain[], 4, '{"levels": [{"difficulty": 25}, {"difficulty": 45}, {"difficulty": 65}, {"difficulty": 85}]}', true, 'sound', 14)
ON CONFLICT (slug) DO NOTHING;
