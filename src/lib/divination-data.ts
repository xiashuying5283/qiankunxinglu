// 周易64卦数据
export interface Hexagram {
  number: number;
  name: string;
  symbol: string;
  upperTrigram: string;
  lowerTrigram: string;
  binary: string;
  judgement: string;
  image: string;
  lines: string[];
}

// 八卦基础数据
export const trigrams = [
  { name: '乾', symbol: '☰', nature: '天', attribute: '刚健' },
  { name: '坤', symbol: '☷', nature: '地', attribute: '柔顺' },
  { name: '震', symbol: '☳', nature: '雷', attribute: '动' },
  { name: '巽', symbol: '☴', nature: '风', attribute: '入' },
  { name: '坎', symbol: '☵', nature: '水', attribute: '险' },
  { name: '离', symbol: '☲', nature: '火', attribute: '明' },
  { name: '艮', symbol: '☶', nature: '山', attribute: '止' },
  { name: '兑', symbol: '☱', nature: '泽', attribute: '悦' },
];

// 64卦完整数据
export const hexagrams: Hexagram[] = [
  {
    number: 1,
    name: '乾',
    symbol: '䷀',
    upperTrigram: '乾',
    lowerTrigram: '乾',
    binary: '111111',
    judgement: '元亨利贞。',
    image: '天行健，君子以自强不息。',
    lines: [
      '初九：潜龙勿用。',
      '九二：见龙在田，利见大人。',
      '九三：君子终日乾乾，夕惕若厉，无咎。',
      '九四：或跃在渊，无咎。',
      '九五：飞龙在天，利见大人。',
      '上九：亢龙有悔。',
    ],
  },
  {
    number: 2,
    name: '坤',
    symbol: '䷁',
    upperTrigram: '坤',
    lowerTrigram: '坤',
    binary: '000000',
    judgement: '元亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞吉。',
    image: '地势坤，君子以厚德载物。',
    lines: [
      '初六：履霜，坚冰至。',
      '六二：直方大，不习无不利。',
      '六三：含章可贞，或从王事，无成有终。',
      '六四：括囊，无咎无誉。',
      '六五：黄裳元吉。',
      '上六：龙战于野，其血玄黄。',
    ],
  },
  {
    number: 3,
    name: '屯',
    symbol: '䷂',
    upperTrigram: '坎',
    lowerTrigram: '震',
    binary: '010001',
    judgement: '元亨利贞，勿用有攸往，利建侯。',
    image: '云雷屯，君子以经纶。',
    lines: [
      '初九：磐桓，利居贞，利建侯。',
      '六二：屯如邅如，乘马班如，匪寇婚媾。女子贞不字，十年乃字。',
      '六三：即鹿无虞，惟入于林中，君子几不如舍，往吝。',
      '六四：乘马班如，求婚媾，往吉，无不利。',
      '九五：屯其膏，小贞吉，大贞凶。',
      '上六：乘马班如，泣血涟如。',
    ],
  },
  {
    number: 4,
    name: '蒙',
    symbol: '䷃',
    upperTrigram: '艮',
    lowerTrigram: '坎',
    binary: '100010',
    judgement: '亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。',
    image: '山下出泉，蒙。君子以果行育德。',
    lines: [
      '初六：发蒙，利用刑人，用说桎梏，以往吝。',
      '九二：包蒙，吉。纳妇，吉。子克家。',
      '六三：勿用取女，见金夫，不有躬，无攸利。',
      '六四：困蒙，吝。',
      '六五：童蒙，吉。',
      '上九：击蒙，不利为寇，利御寇。',
    ],
  },
  {
    number: 5,
    name: '需',
    symbol: '䷄',
    upperTrigram: '坎',
    lowerTrigram: '乾',
    binary: '010111',
    judgement: '有孚，光亨，贞吉，利涉大川。',
    image: '云上于天，需。君子以饮食宴乐。',
    lines: [
      '初九：需于郊，利用恒，无咎。',
      '九二：需于沙，小有言，终吉。',
      '九三：需于泥，致寇至。',
      '六四：需于血，出自穴。',
      '九五：需于酒食，贞吉。',
      '上六：入于穴，有不速之客三人来，敬之终吉。',
    ],
  },
  {
    number: 6,
    name: '讼',
    symbol: '䷅',
    upperTrigram: '乾',
    lowerTrigram: '坎',
    binary: '111010',
    judgement: '有孚窒惕，中吉，终凶。利见大人，不利涉大川。',
    image: '天与水违行，讼。君子以作事谋始。',
    lines: [
      '初六：不永所事，小有言，终吉。',
      '九二：不克讼，归而逋其邑人三百户，无眚。',
      '六三：食旧德，贞厉，终吉。或从王事，无成。',
      '六四：不克讼，复即命渝，安贞吉。',
      '九五：讼元吉。',
      '上九：或锡之鞶带，终朝三褫之。',
    ],
  },
  {
    number: 7,
    name: '师',
    symbol: '䷆',
    upperTrigram: '坤',
    lowerTrigram: '坎',
    binary: '000010',
    judgement: '贞丈人吉，无咎。',
    image: '地中有水，师。君子以容民畜众。',
    lines: [
      '初六：师出以律，否臧凶。',
      '九二：在师中吉，无咎，王三锡命。',
      '六三：师或舆尸，凶。',
      '六四：师左次，无咎。',
      '六五：田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。',
      '上六：大君有命，开国承家，小人勿用。',
    ],
  },
  {
    number: 8,
    name: '比',
    symbol: '䷇',
    upperTrigram: '坎',
    lowerTrigram: '坤',
    binary: '010000',
    judgement: '吉。原筮元永贞，无咎。不宁方来，后夫凶。',
    image: '地上有水，比。先王以建万国，亲诸侯。',
    lines: [
      '初六：有孚比之，无咎。有孚盈缶，终来有它，吉。',
      '六二：比之自内，贞吉。',
      '六三：比之匪人。',
      '六四：外比之，贞吉。',
      '九五：显比，王用三驱，失前禽，邑人不诫，吉。',
      '上六：比之无首，凶。',
    ],
  },
];

// 塔罗牌数据
export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  number?: number;
  upright: string;
  reversed: string;
  keywords: string[];
  description: string;
}

export const majorArcana: TarotCard[] = [
  {
    id: 0,
    name: '愚者',
    arcana: 'major',
    upright: '新的开始、冒险、纯真、自由',
    reversed: '鲁莽、轻率、愚昧、冒险',
    keywords: ['新开始', '冒险', '自由', '纯真'],
    description: '愚者代表新的旅程和无限可能。他站在悬崖边，象征着踏入未知的勇气。',
  },
  {
    id: 1,
    name: '魔术师',
    arcana: 'major',
    upright: '创造力、意志力、技巧、新机会',
    reversed: '欺骗、操纵、才能浪费',
    keywords: ['创造', '意志', '技巧', '机会'],
    description: '魔术师象征着将想法转化为现实的能力，他掌握着四大元素的运用。',
  },
  {
    id: 2,
    name: '女祭司',
    arcana: 'major',
    upright: '直觉、神秘、智慧、潜意识',
    reversed: '隐藏的意图、表面化、缺乏个人和谐',
    keywords: ['直觉', '神秘', '智慧', '潜意识'],
    description: '女祭司代表内在的智慧和直觉力量，她守护着知识的大门。',
  },
  {
    id: 3,
    name: '女皇',
    arcana: 'major',
    upright: '丰饶、母性、创造、自然',
    reversed: '依赖、空虚、过度保护',
    keywords: ['丰饶', '母性', '创造', '自然'],
    description: '女皇象征着生命的创造力和丰饶，她代表大地之母的形象。',
  },
  {
    id: 4,
    name: '皇帝',
    arcana: 'major',
    upright: '权威、结构、控制、父亲形象',
    reversed: '专制、僵化、过度控制',
    keywords: ['权威', '结构', '控制', '领导'],
    description: '皇帝代表秩序、权威和物质世界的统治者。',
  },
  {
    id: 5,
    name: '教皇',
    arcana: 'major',
    upright: '传统、信仰、精神指导、婚姻',
    reversed: '叛逆、颠覆、新观点',
    keywords: ['传统', '信仰', '指导', '婚姻'],
    description: '教皇象征着精神上的指引和传统的智慧。',
  },
  {
    id: 6,
    name: '恋人',
    arcana: 'major',
    upright: '爱情、和谐、选择、价值观',
    reversed: '不和谐、失衡、错误选择',
    keywords: ['爱情', '和谐', '选择', '关系'],
    description: '恋人牌代表爱情关系，也象征着人生中的重要抉择。',
  },
  {
    id: 7,
    name: '战车',
    arcana: 'major',
    upright: '意志力、决心、成功、行动',
    reversed: '失控、侵略、缺乏方向',
    keywords: ['意志', '胜利', '决心', '行动'],
    description: '战车象征着通过决心和意志力取得胜利。',
  },
  {
    id: 8,
    name: '力量',
    arcana: 'major',
    upright: '勇气、耐心、内在力量、同情心',
    reversed: '自我怀疑、软弱、缺乏自信',
    keywords: ['力量', '勇气', '耐心', '内在力量'],
    description: '力量牌代表内在的勇气和以柔克刚的智慧。',
  },
  {
    id: 9,
    name: '隐士',
    arcana: 'major',
    upright: '内省、寻求真理、孤独、指导',
    reversed: '孤立、孤独、退缩',
    keywords: ['内省', '寻求', '智慧', '独处'],
    description: '隐士代表着向内寻求答案和真理的旅程。',
  },
  {
    id: 10,
    name: '命运之轮',
    arcana: 'major',
    upright: '改变、命运、好运、转折点',
    reversed: '厄运、抵抗改变、失控',
    keywords: ['命运', '改变', '循环', '好运'],
    description: '命运之轮象征着生命的循环和命运的转变。',
  },
  {
    id: 11,
    name: '正义',
    arcana: 'major',
    upright: '公正、真理、法律、平衡',
    reversed: '不公正、不诚实、缺乏责任感',
    keywords: ['正义', '真理', '法律', '平衡'],
    description: '正义牌代表公平、真理和因果法则。',
  },
  {
    id: 12,
    name: '倒吊人',
    arcana: 'major',
    upright: '牺牲、放手、新视角、等待',
    reversed: '拖延、抵抗、无谓牺牲',
    keywords: ['牺牲', '等待', '新视角', '放手'],
    description: '倒吊人象征着通过牺牲和等待获得新的洞见。',
  },
  {
    id: 13,
    name: '死神',
    arcana: 'major',
    upright: '结束、转变、过渡、放手',
    reversed: '抵抗改变、停滞、无法放手',
    keywords: ['结束', '转变', '新生', '过渡'],
    description: '死神牌代表旧事物的结束和新生活的开始，而非字面上的死亡。',
  },
  {
    id: 14,
    name: '节制',
    arcana: 'major',
    upright: '平衡、调和、耐心、适度',
    reversed: '失衡、过度、缺乏长远眼光',
    keywords: ['平衡', '调和', '耐心', '适度'],
    description: '节制牌象征着平衡、调和与中庸之道。',
  },
  {
    id: 15,
    name: '恶魔',
    arcana: 'major',
    upright: '束缚、诱惑、物质主义、阴影自我',
    reversed: '解脱、打破束缚、面对阴影',
    keywords: ['束缚', '诱惑', '物质', '欲望'],
    description: '恶魔牌代表我们内心的阴影和需要克服的束缚。',
  },
  {
    id: 16,
    name: '塔',
    arcana: 'major',
    upright: '突然改变、崩溃、启示、觉醒',
    reversed: '避免灾难、恐惧改变、延迟崩溃',
    keywords: ['改变', '崩溃', '觉醒', '解放'],
    description: '塔牌象征着旧结构的崩塌和必要的改变。',
  },
  {
    id: 17,
    name: '星星',
    arcana: 'major',
    upright: '希望、灵感、宁静、重生',
    reversed: '绝望、缺乏信心、失去希望',
    keywords: ['希望', '灵感', '宁静', '重生'],
    description: '星星牌代表黑暗过后的希望和指引。',
  },
  {
    id: 18,
    name: '月亮',
    arcana: 'major',
    upright: '幻象、恐惧、焦虑、潜意识',
    reversed: '释放恐惧、压抑情绪、混乱',
    keywords: ['幻象', '直觉', '恐惧', '潜意识'],
    description: '月亮牌象征着不确定性和内心的恐惧与幻象。',
  },
  {
    id: 19,
    name: '太阳',
    arcana: 'major',
    upright: '快乐、成功、活力、积极',
    reversed: '暂时的挫折、过度乐观、延迟的成功',
    keywords: ['快乐', '成功', '活力', '光明'],
    description: '太阳牌是最积极的牌之一，代表成功、快乐和光明。',
  },
  {
    id: 20,
    name: '审判',
    arcana: 'major',
    upright: '觉醒、重生、召唤、宽恕',
    reversed: '自我怀疑、拒绝召唤、逃避审判',
    keywords: ['觉醒', '重生', '召唤', '宽恕'],
    description: '审判牌象征着生命的觉醒和新的召唤。',
  },
  {
    id: 21,
    name: '世界',
    arcana: 'major',
    upright: '完成、成就、旅行、圆满',
    reversed: '未完成、缺乏闭合、寻求闭合',
    keywords: ['完成', '成就', '圆满', '成功'],
    description: '世界牌代表一个循环的完成和目标的达成。',
  },
];

// 梅花易数相关数据
export const plumNumbers = {
  heavenlyStems: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  earthlyBranches: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  fiveElements: {
    wood: { name: '木', trigrams: ['震', '巽'], number: [3, 8] },
    fire: { name: '火', trigrams: ['离'], number: [2, 7] },
    earth: { name: '土', trigrams: ['坤', '艮'], number: [5, 10] },
    metal: { name: '金', trigrams: ['乾', '兑'], number: [4, 9] },
    water: { name: '水', trigrams: ['坎'], number: [1, 6] },
  },
};

// 字形笔画数据（简化版）
export const charStrokes: Record<string, number> = {
  '一': 1, '二': 2, '三': 3, '四': 5, '五': 4,
  '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
  '天': 4, '地': 6, '人': 2, '日': 4, '月': 4,
  '水': 4, '火': 4, '山': 3, '风': 4, '雷': 13,
  '龙': 5, '虎': 8, '凤': 4, '福': 13, '禄': 12,
  '寿': 7, '喜': 12, '财': 10, '爱': 10, '缘': 12,
  '命': 8, '运': 7, '吉': 6, '凶': 4, '安': 6,
  '康': 11, '宁': 5, '和': 8, '平': 5, '顺': 9,
};
