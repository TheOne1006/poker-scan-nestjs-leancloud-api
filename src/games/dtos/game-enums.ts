export enum DirectionEnum {
  // 向上
  UP = 'up',
  // 向左
  LEFT = 'left',
  // 向右
  RIGHT = 'right',
  // 向下
  DOWN = 'down',
}

export enum GameRuleEnum {
  // 经典斗地主规则
  StandardDouDiZhu = 'RuleStandardDouDiZhu',
  // 四人斗地主规则
  DouDiZhu4Player = 'RuleDouDiZhu4Player',
  // 掼蛋规则
  StandardGuanDan = 'RuleStandardGuanDan',
  // 跑得快规则
  StandardPaoDeKuai = 'RuleStandardPaoDeKuai',
  // 争上游规则
  StandardZhengShangYou = 'RuleStandardZhengShangYou',
  // 510K规则
  Standard3Played510K = 'RuleStandard3Played510K',
  // 自定义规则
  Custom = 'RuleCustom',
}

export enum MoveGeneratorEnum {
  // 自定义出牌生成器
  CustomMoveGenerator = 'CustomMoveGenerator',
  // 510K出牌生成器
  Standard3Played510KMoveGenerator = 'Standard3Played510KMoveGenerator',
  // 四人斗地主出牌生成器
  DouDiZhu4PlayedMoveGenerator = 'DouDiZhu4PlayedMoveGenerator',
  // 跑得快出牌生成器
  PaoDeKuaiMoveGenerator = 'PaoDeKuaiMoveGenerator',
  // 任意出牌生成器
  AnyMoveGenerator = 'AnyMoveGenerator',
}

export enum AreaTypeEnum {
  // 自己的手牌区域
  SelfHand = 'selfHand',
  // 自己的出牌区域
  SelfDiscard = 'selfDiscard',
  // 上家出牌区域
  UpperPlayerDiscard = 'upperPlayerDiscard',
  // 下家出牌区域
  LowerPlayerDiscard = 'lowerPlayerDiscard',
  // 对家出牌区域
  OppositePlayerDiscard = 'oppositePlayerDiscard',
  // 固定区域（如底牌、公共牌等）
  Fixed = 'fixed',
  // 其他区域
  Other = 'other',
}

export enum GameTypeEnum {
  // 经典斗地主
  StandardDouDiZhu = 'standardDouDiZhu',
  // 跑得快
  StandardPaoDeKuai = 'standardPaoDeKuai',
  // 四人斗地主
  DouDiZhu4Player = 'douDiZhu4Player',
  // 掼蛋
  StandardGuanDan = 'standardGuanDan',
  // 争上游
  StandardZhengShangYou = 'standardZhengShangYou',
  // 510K
  Standard3Played510K = 'standard3Played510K',
  // 自定义
  Custom = 'custom',
}
