// 观音灵签100签数据

export interface FortuneStickData {
  number: number;
  title: string;
  poem: string;
  meaning: string;
  level: string;
  story: string;
  interpretation: {
    wealth: string;
    marriage: string;
    career: string;
    travel: string;
    health: string;
    lawsuit: string;
    study: string;
    lost: string;
  };
}

export const fortuneSticksData: FortuneStickData[] = [
  {
    number: 1,
    title: "钟离成道",
    poem: "开天辟地作良缘，吉日良时万物全。\n若得此签非小可，人行忠正帝王宣。",
    meaning: "此签大吉，诸事皆顺。天地开泰，万物化育。得此签者，如得天时地利人和，所求皆遂，但须行正道，方得长久。",
    level: "上上签",
    story: "汉钟离，姓钟离名权，燕台人。官至大将军，后遇东华帝君授以长生诀，得道成仙，为八仙之一。",
    interpretation: {
      wealth: "大吉，财源广进，投资获利。",
      marriage: "天作之合，姻缘美满。",
      career: "事业亨通，升迁有望。",
      travel: "出行大吉，贵人相助。",
      health: "身体健康，精神饱满。",
      lawsuit: "胜诉在望，公道在握。",
      study: "学业精进，金榜题名。",
      lost: "失物可寻，早去寻觅。"
    }
  },
  {
    number: 2,
    title: "苏武牧羊",
    poem: "鸟语花香景艳阳，心田未静强商量。\n如今且把归途看，切莫今朝恋晚芳。",
    meaning: "此签中平，不宜急进。眼前虽有美景，但内心未静，不可贸然行事。当守正待时，静候良机。",
    level: "中平签",
    story: "苏武，汉朝人。出使匈奴，被扣留十九年，牧羊北海。持节不屈，后得归汉。",
    interpretation: {
      wealth: "财运平平，不宜投机。",
      marriage: "缘分未到，耐心等待。",
      career: "守成为上，不宜变动。",
      travel: "暂缓出行，静观其变。",
      health: "注意调养，心静为上。",
      lawsuit: "宜和解，不宜争执。",
      study: "勤勉用功，循序渐进。",
      lost: "难寻，防再次丢失。"
    }
  },
  {
    number: 3,
    title: "董永卖身",
    poem: "临风冒雨过前山，正是干戈战未闲。\n须向此时求善策，如今不必问容颜。",
    meaning: "此签中吉，先苦后甜。目前虽有困难，如风雨前行，但只要坚持努力，终会苦尽甘来。",
    level: "中吉签",
    story: "董永，汉朝人。家贫卖身葬父，天帝怜其孝，遣织女下凡助其还债。",
    interpretation: {
      wealth: "先损后得，守得云开。",
      marriage: "真诚相待，姻缘可成。",
      career: "创业艰难，终有所成。",
      travel: "出行有利，贵人相助。",
      health: "小恙无碍，注意休息。",
      lawsuit: "先败后胜，坚持为上。",
      study: "勤能补拙，终成大器。",
      lost: "难寻，但可弥补。"
    }
  },
  {
    number: 4,
    title: "玄德请诸葛",
    poem: "千里迢迢往西求，前途美景自悠悠。\n问君但看前头路，万事俱成乐无忧。",
    meaning: "此签上吉，前途光明。如刘备三顾茅庐请诸葛亮，诚心必有所获。出行大吉，求谋顺利。",
    level: "上吉签",
    story: "刘备，字玄德，三国蜀汉先主。三顾茅庐请诸葛亮出山，如鱼得水，终成霸业。",
    interpretation: {
      wealth: "求财得财，贵人相助。",
      marriage: "良缘天定，终成眷属。",
      career: "事业有成，贵人提拔。",
      travel: "出行大吉，必有收获。",
      health: "平安健康，精神愉快。",
      lawsuit: "有贵人助，胜诉在望。",
      study: "名师指点，学业大进。",
      lost: "可寻，问于西方。"
    }
  },
  {
    number: 5,
    title: "吕蒙正破窑",
    poem: "一箭射红心，人人说好音。\n高低且随分，高低且随分。",
    meaning: "此签上吉，功名可求。虽有波折，终能成功。耐心等待，时机自到。高低起伏皆是命，守得云开见月明。",
    level: "上吉签",
    story: "吕蒙正，宋朝宰相。少时贫苦，住破窑中苦读，后状元及第，官至宰相。",
    interpretation: {
      wealth: "先贫后富，苦尽甘来。",
      marriage: "姻缘天定，不论贫富。",
      career: "功名可成，大器晚成。",
      travel: "出行有利，遇贵人。",
      health: "注意调养，莫过劳。",
      lawsuit: "先难后易，终能胜。",
      study: "刻苦用功，必有成。",
      lost: "可寻，问于高处。"
    }
  },
  {
    number: 6,
    title: "仁贵投军",
    poem: "投身岩下铜鸟居，须是还他大丈夫。\n早晚功名终有望，由天勿用自图谋。",
    meaning: "此签中平，顺其自然。不要强求，随缘而行。时机未到，宜守不宜进。功名终有望，但需等待天时。",
    level: "中平签",
    story: "薛仁贵，唐朝名将。少年贫寒，后投军建功，三箭定天山，封平辽王。",
    interpretation: {
      wealth: "财运未至，守待时机。",
      marriage: "缘分未到，静候佳音。",
      career: "时机未熟，韬光养晦。",
      travel: "不宜远行，近处为佳。",
      health: "注意保养，勿操劳。",
      lawsuit: "宜和为贵，不宜争。",
      study: "勤奋努力，待时而动。",
      lost: "难寻，防破财。"
    }
  },
  {
    number: 7,
    title: "苏秦刺股",
    poem: "奔波役役重重险，若要还时莫要贪。\n心正自然无伤害，出入求谋定不难。",
    meaning: "此签中吉，需经磨炼。勤奋努力，终有所成。切勿投机取巧，脚踏实地为上。",
    level: "中吉签",
    story: "苏秦，战国时人。游说诸国不遇，归家苦读，引锥刺股，终成合纵之策，佩六国相印。",
    interpretation: {
      wealth: "勤劳致富，不宜贪求。",
      marriage: "真诚待人，姻缘可成。",
      career: "艰苦奋斗，终有所成。",
      travel: "出行顺利，但需谨慎。",
      health: "注意休息，勿过劳。",
      lawsuit: "心正无惧，终能胜。",
      study: "刻苦用功，必有成。",
      lost: "可寻，问于东方。"
    }
  },
  {
    number: 8,
    title: "姜公渭水钓鱼",
    poem: "绿水青山景色新，前途渐渐见光明。\n若有贵人相助力，平地一声雷惊人。",
    meaning: "此签上吉，贵人相助。耐心等待时机，必有贵人出现，事业将有大的突破。",
    level: "上吉签",
    story: "姜子牙，周朝太师。渭水垂钓，等待时机，八十岁遇文王，辅佐武王伐纣，功成名就。",
    interpretation: {
      wealth: "贵人相助，财运亨通。",
      marriage: "良缘将至，贵人牵线。",
      career: "遇贵人，事业有成。",
      travel: "出行大吉，遇贵人。",
      health: "健康良好，精神愉快。",
      lawsuit: "有贵人助，胜诉有望。",
      study: "名师指点，学业大成。",
      lost: "可寻，贵人相助。"
    }
  },
  {
    number: 9,
    title: "孔明入川",
    poem: "昔因路险要迷踪，今日前途尽许通。\n步步经营皆有利，前程大道任西东。",
    meaning: "此签上吉，前途畅通。过去的障碍已经消除，现在可以放心前行，一切顺利。",
    level: "上吉签",
    story: "诸葛亮，字孔明，三国蜀汉丞相。入川辅佐刘备，建立蜀汉基业。",
    interpretation: {
      wealth: "财路畅通，投资有利。",
      marriage: "姻缘顺遂，美满幸福。",
      career: "事业发展，步步高升。",
      travel: "出行大吉，万事顺遂。",
      health: "平安健康，无灾无难。",
      lawsuit: "胜诉，公道在握。",
      study: "学业顺利，前程似锦。",
      lost: "可寻，问于西方。"
    }
  },
  {
    number: 10,
    title: "庞涓观阵",
    poem: "石小皆因块大难，前程莫把望高攀。\n若是有心勤作事，暂时忍耐自有还。",
    meaning: "此签中平，不宜好高骛远。脚踏实地，循序渐进。切勿贪大求全，稳扎稳打为上。",
    level: "中平签",
    story: "庞涓，战国时魏国大将。与孙膑同学兵法，后嫉妒孙膑，终败于孙膑之手。",
    interpretation: {
      wealth: "小利可得，不宜贪大。",
      marriage: "缘分一般，不宜强求。",
      career: "稳扎稳打，不宜冒进。",
      travel: "近处为佳，不宜远行。",
      health: "注意调养，防小疾。",
      lawsuit: "宜和不宜争，防小人。",
      study: "勤勉为上，不求速成。",
      lost: "难寻，防再失。"
    }
  },
  // 第11-20签
  {
    number: 11,
    title: "韩信功劳",
    poem: "绿水青山色更鲜，逍遥景物正当前。\n若将此签来问我，财运亨通福禄全。",
    meaning: "此签上上，大吉大利。财运亨通，事业顺遂，家庭和睦，诸事皆宜。",
    level: "上上签",
    story: "韩信，汉朝开国功臣。助刘邦灭项羽，封齐王，后为吕后所杀。",
    interpretation: {
      wealth: "大吉大利，财源广进。",
      marriage: "美满幸福，天作之合。",
      career: "功成名就，飞黄腾达。",
      travel: "出行大吉，一路平安。",
      health: "身体健康，精神焕发。",
      lawsuit: "胜诉无疑，公道在握。",
      study: "学业大成，前途光明。",
      lost: "可寻，完好无损。"
    }
  },
  {
    number: 12,
    title: "武则天登基",
    poem: "威风凛凛万人钦，莫道英雄非女身。\n若逢此签来相问，无事不成乐太平。",
    meaning: "此签上吉，事业有成。无论男女，皆可建功立业。把握机会，勇往直前。",
    level: "上吉签",
    story: "武则天，中国历史上唯一的女皇帝。才智过人，终登帝位，建立武周。",
    interpretation: {
      wealth: "财运亨通，事业有成。",
      marriage: "姻缘可成，不论男女。",
      career: "功名可求，大显身手。",
      travel: "出行有利，遇贵人。",
      health: "健康良好，精神饱满。",
      lawsuit: "胜诉在望，有理有据。",
      study: "学业精进，不分男女。",
      lost: "可寻，贵人相助。"
    }
  },
  {
    number: 13,
    title: "罗通拜帅",
    poem: "不必心高不必忙，也须事事要商量。\n但愿一心皆稳静，家门安乐自荣昌。",
    meaning: "此签中平，安分为上。不要好高骛远，脚踏实地经营，家庭自然安乐。",
    level: "中平签",
    story: "罗通，唐朝名将罗成之子。少年英雄，拜帅出征，建立功勋。",
    interpretation: {
      wealth: "平稳求财，不宜冒险。",
      marriage: "安分守己，姻缘可成。",
      career: "稳扎稳打，循序渐进。",
      travel: "近处为佳，不宜远行。",
      health: "注意调养，心平气和。",
      lawsuit: "宜和不宜争，和气生财。",
      study: "勤奋努力，不求速成。",
      lost: "难寻，防再失。"
    }
  },
  {
    number: 14,
    title: "子牙弃官",
    poem: "卦逢吉兆在眼前，经营出入两俱全。\n生意滔滔如流水，财源滚滚似涌泉。",
    meaning: "此签上吉，财运亨通。经商大吉，投资顺利，财源广进，事业兴旺。",
    level: "上吉签",
    story: "姜子牙，年七十余仍一事无成，后弃官归隐，终遇文王，成就大业。",
    interpretation: {
      wealth: "大吉大利，财源滚滚。",
      marriage: "姻缘美满，幸福如意。",
      career: "事业有成，前途光明。",
      travel: "出行大吉，生意兴隆。",
      health: "健康良好，精力充沛。",
      lawsuit: "胜诉在望，有利可图。",
      study: "学业有成，前途无量。",
      lost: "可寻，财物完好。"
    }
  },
  {
    number: 15,
    title: "苏秦背剑",
    poem: "东风解冻雪消时，万物逢春发旧枝。\n这日若来求得意，花开正是太阳时。",
    meaning: "此签上吉，春回大地。困境将过，好运将至。把握时机，奋发向前。",
    level: "上吉签",
    story: "苏秦，战国时纵横家。佩六国相印，权倾天下，如春风得意。",
    interpretation: {
      wealth: "财运好转，时机已到。",
      marriage: "良缘将至，春暖花开。",
      career: "事业转机，把握机会。",
      travel: "出行有利，遇贵人。",
      health: "健康好转，精神愉快。",
      lawsuit: "转败为胜，时机已到。",
      study: "学业进步，春华秋实。",
      lost: "可寻，时机已到。"
    }
  },
  {
    number: 16,
    title: "叶梦雄朝帝",
    poem: "天开地阔志能伸，万事皆成贵人亲。\n时来运到人财旺，紫气东来满堂春。",
    meaning: "此签上上，万事如意。贵人相助，事业亨通，财运旺盛，前途无量。",
    level: "上上签",
    story: "叶梦雄，宋朝人。才华横溢，得皇帝赏识，官运亨通。",
    interpretation: {
      wealth: "大吉大利，财源广进。",
      marriage: "天赐良缘，美满幸福。",
      career: "飞黄腾达，贵人提拔。",
      travel: "出行大吉，遇贵人。",
      health: "身体健康，精神焕发。",
      lawsuit: "胜诉无疑，贵人相助。",
      study: "金榜题名，前程似锦。",
      lost: "可寻，完好无损。"
    }
  },
  {
    number: 17,
    title: "话梅止渴",
    poem: "渴望梅林只画饼，几番空想费精神。\n若要真正解焦渴，还须实地去寻津。",
    meaning: "此签下下，空想无益。不要只做白日梦，需要实际行动才能成功。",
    level: "下下签",
    story: "曹操率军，兵士口渴。曹操指前方有梅林，兵士口中生津，得以解渴。此为望梅止渴典故。",
    interpretation: {
      wealth: "空想无益，需实际努力。",
      marriage: "缘分未到，不宜强求。",
      career: "好高骛远，难有所成。",
      travel: "不宜出行，原地待时。",
      health: "注意调养，勿过度。",
      lawsuit: "败诉，宜和解。",
      study: "空想无用，需实际努力。",
      lost: "难寻，防破财。"
    }
  },
  {
    number: 18,
    title: "曹操献刀",
    poem: "心中有事暗相猜，行事多疑费尽才。\n得此签者宜守正，莫教小辈把头抬。",
    meaning: "此签中平，宜守不宜进。凡事三思，谨慎行事。不要轻信他人，以免受骗。",
    level: "中平签",
    story: "曹操，三国时魏国奠基人。曾献刀行刺董卓，事败逃走。多疑善谋。",
    interpretation: {
      wealth: "谨慎求财，防被骗。",
      marriage: "需真诚相待，防误会。",
      career: "谨慎行事，防小人。",
      travel: "不宜远行，近处为佳。",
      health: "注意调养，心神不定。",
      lawsuit: "宜和解，不宜争执。",
      study: "专心致志，防分心。",
      lost: "难寻，防被盗。"
    }
  },
  {
    number: 19,
    title: "子仪封王",
    poem: "福星高照遇贵人，诸事呈祥福自临。\n前途无阻皆顺遂，荣华富贵耀门庭。",
    meaning: "此签上上，福星高照。贵人相助，万事顺遂，荣华富贵，前程似锦。",
    level: "上上签",
    story: "郭子仪，唐朝名将。平定安史之乱，功勋卓著，封汾阳王，寿至八旬。",
    interpretation: {
      wealth: "大吉大利，财源广进。",
      marriage: "天作之合，幸福美满。",
      career: "功成名就，荣华富贵。",
      travel: "出行大吉，遇贵人。",
      health: "健康长寿，精神矍铄。",
      lawsuit: "胜诉无疑，公道在握。",
      study: "学业大成，前途无量。",
      lost: "可寻，贵人相助。"
    }
  },
  {
    number: 20,
    title: "姜维接印",
    poem: "秋来菊花正芬芳，事业功名渐渐昌。\n若遇贵人相助力，如同枯木又逢春。",
    meaning: "此签上吉，事业渐兴。贵人相助，如枯木逢春，事业将有大的发展。",
    level: "上吉签",
    story: "姜维，三国蜀汉大将。继承诸葛亮遗志，九伐中原，忠心不二。",
    interpretation: {
      wealth: "渐入佳境，财运好转。",
      marriage: "良缘将至，贵人牵线。",
      career: "事业渐兴，贵人相助。",
      travel: "出行有利，遇贵人。",
      health: "健康好转，精神愉快。",
      lawsuit: "转败为胜，贵人相助。",
      study: "学业进步，前途光明。",
      lost: "可寻，问于西方。"
    }
  }
];
