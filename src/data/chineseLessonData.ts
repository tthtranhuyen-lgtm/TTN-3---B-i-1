import { VocabItem, SentenceItem, ExerciseItem, GrammarPattern } from '../types';

export const VOCABULARY_LIST: VocabItem[] = [
  {
    id: 'zhoumo',
    hanzi: '周末',
    pinyin: 'zhōumò',
    vietnamese: 'Cuối tuần',
    category: 'time',
    emoji: '🎈',
    exampleSentence: '周末你在做什么？周末我在家。',
    examplePinyin: 'Zhōumò nǐ zài zuò shénme? Zhōumò wǒ zài jiā.',
    exampleVietnamese: 'Cuối tuần bạn đang làm gì? Cuối tuần tôi ở nhà.',
    characters: ['周', '末']
  },
  {
    id: 'laoshi',
    hanzi: '老师',
    pinyin: 'lǎoshī',
    vietnamese: 'Giáo viên, thầy cô giáo',
    category: 'person',
    emoji: '👩‍🏫',
    exampleSentence: '她是老师。老师在学校。',
    examplePinyin: 'Tā shì lǎoshī. Lǎoshī zài xuéxiào.',
    exampleVietnamese: 'Cô ấy là giáo viên. Giáo viên ở trường học.',
    characters: ['老', '师']
  },
  {
    id: 'zai',
    hanzi: '在',
    pinyin: 'zài',
    vietnamese: 'Ở, tại',
    category: 'grammar',
    emoji: '📍',
    exampleSentence: '老师在学校。我在家吃饭。',
    examplePinyin: 'Lǎoshī zài xuéxiào. Wǒ zài jiā chī fàn.',
    exampleVietnamese: 'Cô giáo ở trường. Tôi ở nhà ăn cơm.',
    characters: ['在']
  },
  {
    id: 'you',
    hanzi: '有',
    pinyin: 'yǒu',
    vietnamese: 'Có',
    category: 'verb',
    emoji: '✨',
    exampleSentence: '我家有四个人。',
    examplePinyin: 'Wǒ jiā yǒu sì ge rén.',
    exampleVietnamese: 'Gia đình tôi có bốn người.',
    characters: ['有']
  },
  {
    id: 'ta',
    hanzi: '它',
    pinyin: 'tā',
    vietnamese: 'Nó (con vật, đồ vật)',
    category: 'noun',
    emoji: '🐰',
    exampleSentence: '它很可爱。我很喜欢它。',
    examplePinyin: 'Tā hěn kě\'ài. Wǒ hěn xǐhuan tā.',
    exampleVietnamese: 'Nó rất dễ thương. Tôi rất thích nó.',
    characters: ['它']
  },
  {
    id: 'piaoliang',
    hanzi: '漂亮',
    pinyin: 'piàoliang',
    vietnamese: 'Xinh đẹp',
    category: 'adjective',
    emoji: '🌸',
    exampleSentence: '她很漂亮。',
    examplePinyin: 'Tā hěn piàoliang.',
    exampleVietnamese: 'Cô ấy rất xinh đẹp.',
    characters: ['漂', '亮']
  },
  {
    id: 'biyou',
    hanzi: '笔友',
    pinyin: 'bǐyǒu',
    vietnamese: 'Bạn qua thư',
    category: 'person',
    emoji: '✉️',
    exampleSentence: '我有一个外国笔友。',
    examplePinyin: 'Wǒ yǒu yí gè wàiguó bǐyǒu.',
    exampleVietnamese: 'Tôi có một người bạn qua thư nước ngoài.',
    characters: ['笔', '友']
  },
  {
    id: 'meiyou',
    hanzi: '没有',
    pinyin: 'méiyǒu',
    vietnamese: 'Không có',
    category: 'verb',
    emoji: '🙅‍♂️',
    exampleSentence: '我没有哥哥。',
    examplePinyin: 'Wǒ méiyǒu gēge.',
    exampleVietnamese: 'Tôi không có anh trai.',
    characters: ['没', '有']
  },
  {
    id: 'chi',
    hanzi: '吃',
    pinyin: 'chī',
    vietnamese: 'Ăn',
    category: 'verb',
    emoji: '🍽️',
    exampleSentence: '我吃苹果。你吃点心吗？',
    examplePinyin: 'Wǒ chī píngguǒ. Nǐ chī diǎnxin ma?',
    exampleVietnamese: 'Tôi ăn táo. Bạn ăn điểm tâm không?',
    characters: ['吃']
  },
  {
    id: 'dianxin',
    hanzi: '点心',
    pinyin: 'diǎnxin',
    vietnamese: 'Điểm tâm, đồ ăn nhẹ, bánh ngọt',
    category: 'noun',
    emoji: '🥟',
    exampleSentence: '我喜欢吃中国点心。',
    examplePinyin: 'Wǒ xǐhuan chī Zhōngguó diǎnxin.',
    exampleVietnamese: 'Tôi thích ăn điểm tâm Trung Quốc.',
    characters: ['点', '心']
  },
  {
    id: 'shuiguo',
    hanzi: '水果',
    pinyin: 'shuǐguǒ',
    vietnamese: 'Trái cây, hoa quả',
    category: 'noun',
    emoji: '🍓',
    exampleSentence: '我姐姐很喜欢吃水果。',
    examplePinyin: 'Wǒ jiějie hěn xǐhuan chī shuǐguǒ.',
    exampleVietnamese: 'Chị gái tôi rất thích ăn trái cây.',
    characters: ['水', '果']
  },
  {
    id: 'pingguo',
    hanzi: '苹果',
    pinyin: 'píngguǒ',
    vietnamese: 'Quả táo',
    category: 'noun',
    emoji: '🍎',
    exampleSentence: '我吃苹果。',
    examplePinyin: 'Wǒ chī píngguǒ.',
    exampleVietnamese: 'Tôi ăn táo.',
    characters: ['苹', '果']
  },
  {
    id: 'gen',
    hanzi: '跟',
    pinyin: 'gēn',
    vietnamese: 'Cùng, với',
    category: 'grammar',
    emoji: '🤝',
    exampleSentence: '我跟你去学校。我跟朋友去打羽毛球。',
    examplePinyin: 'Wǒ gēn nǐ qù xuéxiào. Wǒ gēn péngyǒu qù dǎ yǔmáoqiú.',
    exampleVietnamese: 'Tôi cùng bạn đi học. Tôi cùng bạn đi đánh cầu lông.',
    characters: ['跟']
  },
  {
    id: 'yiqi',
    hanzi: '一起',
    pinyin: 'yìqǐ',
    vietnamese: 'Cùng nhau',
    category: 'grammar',
    emoji: '👫',
    exampleSentence: '我们一起去公园。',
    examplePinyin: 'Wǒmen yìqǐ qù gōngyuán.',
    exampleVietnamese: 'Chúng mình cùng nhau đi công viên nhé.',
    characters: ['一', '起']
  },
  {
    id: 'gongyuan',
    hanzi: '公园',
    pinyin: 'gōngyuán',
    vietnamese: 'Công viên',
    category: 'noun',
    emoji: '🌳',
    exampleSentence: '小朋友很喜欢去公园。',
    examplePinyin: 'Xiǎopéngyǒu hěn xǐhuan qù gōngyuán.',
    exampleVietnamese: 'Các bạn nhỏ rất thích đi công viên chơi.',
    characters: ['公', '园']
  }
];

export const EXAMPLE_SENTENCES: SentenceItem[] = [
  {
    id: 's1',
    chinese: '周末你做什么？',
    pinyin: 'Zhōumò nǐ zuò shénme?',
    vietnamese: 'Cuối tuần bạn làm gì?',
    tag: 'Cuối tuần',
    emoji: '🗓️'
  },
  {
    id: 's2',
    chinese: '周末我在家。',
    pinyin: 'Zhōumò wǒ zài jiā.',
    vietnamese: 'Cuối tuần tôi ở nhà.',
    tag: 'Ở nhà',
    emoji: '🏡'
  },
  {
    id: 's3',
    chinese: '她是老师。',
    pinyin: 'Tā shì lǎoshī.',
    vietnamese: 'Cô ấy là giáo viên.',
    tag: 'Giáo viên',
    emoji: '👩‍🏫'
  },
  {
    id: 's4',
    chinese: '老师在学校。',
    pinyin: 'Lǎoshī zài xuéxiào.',
    vietnamese: 'Thầy cô ở trường học.',
    tag: 'Trường học',
    emoji: '🏫'
  },
  {
    id: 's5',
    chinese: '我家有四个人。',
    pinyin: 'Wǒ jiā yǒu sì ge rén.',
    vietnamese: 'Nhà tôi có bốn người.',
    tag: 'Gia đình',
    emoji: '👨‍👩‍👧‍👦'
  },
  {
    id: 's6',
    chinese: '我没有哥哥。',
    pinyin: 'Wǒ méiyǒu gēge.',
    vietnamese: 'Tôi không có anh trai.',
    tag: 'Gia đình',
    emoji: '🧒'
  },
  {
    id: 's7',
    chinese: '它很可爱。',
    pinyin: 'Tā hěn kě\'ài.',
    vietnamese: 'Nó rất dễ thương.',
    tag: 'Khen ngợi',
    emoji: '🐱'
  },
  {
    id: 's8',
    chinese: '我很喜欢它。',
    pinyin: 'Wǒ hěn xǐhuan tā.',
    vietnamese: 'Tôi rất thích nó.',
    tag: 'Yêu thích',
    emoji: '💖'
  },
  {
    id: 's9',
    chinese: '我吃苹果。',
    pinyin: 'Wǒ chī píngguǒ.',
    vietnamese: 'Tôi ăn quả táo.',
    tag: 'Ăn uống',
    emoji: '🍎'
  },
  {
    id: 's10',
    chinese: '你吃点心吗？',
    pinyin: 'Nǐ chī diǎnxin ma?',
    vietnamese: 'Bạn ăn điểm tâm (bánh) không?',
    tag: 'Hỏi han',
    emoji: '🥟'
  },
  {
    id: 's11',
    chinese: '我喜欢吃中国点心。',
    pinyin: 'Wǒ xǐhuan chī Zhōngguó diǎnxin.',
    vietnamese: 'Tôi thích ăn điểm tâm Trung Quốc.',
    tag: 'Ăn uống',
    emoji: '🥢'
  },
  {
    id: 's12',
    chinese: '我姐姐很喜欢吃水果。',
    pinyin: 'Wǒ jiějie hěn xǐhuan chī shuǐguǒ.',
    vietnamese: 'Chị gái tôi rất thích ăn hoa quả.',
    tag: 'Sở thích',
    emoji: '🍉'
  },
  {
    id: 's13',
    chinese: '小朋友很喜欢去公园。',
    pinyin: 'Xiǎopéngyǒu hěn xǐhuan qù gōngyuán.',
    vietnamese: 'Các em nhỏ rất thích đi công viên.',
    tag: 'Địa điểm',
    emoji: '🎠'
  }
];

export const FILL_BLANKS_EXERCISES: ExerciseItem[] = [
  {
    id: 1,
    question: '她是我们的 ______ 。',
    beforeBlank: '她是我们的',
    afterBlank: '。',
    correctAnswer: '老师',
    fullPinyin: 'Tā shì wǒmen de lǎoshī.',
    fullVietnamese: 'Cô ấy là giáo viên của chúng em.',
    hint: 'Gợi ý: Người dạy học ở trường (lǎoshī)'
  },
  {
    id: 2,
    question: '明天是 ______ 。',
    beforeBlank: '明天是',
    afterBlank: '。',
    correctAnswer: '周末',
    fullPinyin: 'Míngtiān shì zhōumò.',
    fullVietnamese: 'Ngày mai là cuối tuần.',
    hint: 'Gợi ý: Thứ Bảy và Chủ Nhật (zhōumò)'
  },
  {
    id: 3,
    question: '她很 ______ 。',
    beforeBlank: '她很',
    afterBlank: '。',
    correctAnswer: '漂亮',
    fullPinyin: 'Tā hěn piàoliang.',
    fullVietnamese: 'Cô ấy rất xinh đẹp.',
    hint: 'Gợi ý: Khen ngợi một bạn gái hoặc cô giáo (piàoliang)'
  },
  {
    id: 4,
    question: '我们 ______ 去公园。',
    beforeBlank: '我们',
    afterBlank: '去公园。',
    correctAnswer: '一起',
    fullPinyin: 'Wǒmen yìqǐ qù gōngyuán.',
    fullVietnamese: 'Chúng mình cùng nhau đi công viên.',
    hint: 'Gợi ý: Cùng làm một việc gì đó (yìqǐ)'
  },
  {
    id: 5,
    question: '我喜欢吃 ______ 。',
    beforeBlank: '我喜欢吃',
    afterBlank: '。',
    correctAnswer: '点心',
    fullPinyin: 'Wǒ xǐhuan chī diǎnxin.',
    fullVietnamese: 'Tôi thích ăn điểm tâm.',
    hint: 'Gợi ý: Món ăn nhẹ, bánh trái thơm ngon (diǎnxin)'
  },
  {
    id: 6,
    question: '我们在 ______ 玩。',
    beforeBlank: '我们在',
    afterBlank: '玩。',
    correctAnswer: '公园',
    fullPinyin: 'Wǒmen zài gōngyuán wán.',
    fullVietnamese: 'Chúng mình chơi ở công viên.',
    hint: 'Gợi ý: Nơi có nhiều cây xanh và cầu trượt (gōngyuán)'
  }
];

export const EXERCISE_WORD_POOL = ['老师', '周末', '漂亮', '点心', '公园', '一起'];

export const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: 'g1',
    title: 'Cấu trúc 1: Liệt kê / Nối hai đối tượng',
    structure: 'A + 和 + B',
    meaning: 'A và B',
    color: 'from-pink-400 to-rose-500',
    examples: [
      {
        chinese: '我喜欢喝可乐和喝牛奶。',
        pinyin: 'Wǒ xǐhuan hē kělè hé hē niúnǎi.',
        vietnamese: 'Tôi thích uống coca và uống sữa.',
        breakdown: 'A: 喝可乐 (uống coca) | 和 (và) | B: 喝牛奶 (uống sữa)',
        imageType: 'coke'
      },
      {
        chinese: '我和哥哥看电视。',
        pinyin: 'Wǒ hé gēge kàn diànshì.',
        vietnamese: 'Tôi và anh trai cùng xem tivi.',
        breakdown: 'A: 我 (tôi) | 和 (và) | B: 哥哥 (anh trai)',
        imageType: 'tv'
      }
    ]
  },
  {
    id: 'g2',
    title: 'Cấu trúc 2: Cùng ai làm gì',
    structure: 'A + 跟 + B + V (Hành động)',
    meaning: 'A làm (V) với B',
    color: 'from-amber-400 to-orange-500',
    examples: [
      {
        chinese: '我跟你去学校。',
        pinyin: 'Wǒ gēn nǐ qù xuéxiào.',
        vietnamese: 'Tôi cùng bạn đi đến trường học.',
        breakdown: 'A: 我 | 跟 | B: 你 | V: 去学校 (đi học)',
        imageType: 'school'
      },
      {
        chinese: '我跟朋友去打羽毛球。',
        pinyin: 'Wǒ gēn péngyǒu qù dǎ yǔmáoqiú.',
        vietnamese: 'Tôi cùng bạn đi đánh cầu lông.',
        breakdown: 'A: 我 | 跟 | B: 朋友 (bạn bè) | V: 去打羽毛球 (đánh cầu lông)',
        imageType: 'badminton'
      }
    ]
  },
  {
    id: 'g3',
    title: 'Cấu trúc 3: Ở đâu làm gì',
    structure: '在 + Nơi chốn + V (Hành động)',
    meaning: 'Ở [Nơi chốn] làm [Hành động]',
    color: 'from-emerald-400 to-teal-500',
    examples: [
      {
        chinese: '我在家吃饭。',
        pinyin: 'Wǒ zài jiā chī fàn.',
        vietnamese: 'Tôi ở nhà ăn cơm.',
        breakdown: '在 + 家 (nhà) + 吃饭 (ăn cơm)',
        imageType: 'home'
      },
      {
        chinese: '我和朋友在公园。',
        pinyin: 'Wǒ hé péngyǒu zài gōngyuán.',
        vietnamese: 'Tôi và bạn đang ở công viên.',
        breakdown: '我和朋友 (Chủ ngữ) + 在 + 公园 (công viên)',
        imageType: 'park'
      }
    ]
  }
];
