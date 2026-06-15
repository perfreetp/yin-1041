import type {
  Doctor,
  Patient,
  PatientGroup,
  Exercise,
  Prescription,
  Checkin,
  Assessment,
  Message,
  Appointment,
  NotificationItem,
  TrendDataPoint,
  ProgressDataPoint,
} from '@/types';

export const mockDoctor: Doctor = {
  id: 'doc-001',
  name: '王建国',
  title: '主任医师',
  department: '康复医学科',
  avatar: undefined,
};

export const mockGroups: PatientGroup[] = [
  { id: 'g-001', name: '膝关节术后组', description: '膝关节置换术后康复患者', patientCount: 12, color: '#165DFF' },
  { id: 'g-002', name: '脑卒中组', description: '脑卒中后运动功能障碍', patientCount: 8, color: '#0E7368' },
  { id: 'g-003', name: '肩袖损伤组', description: '肩关节术后康复', patientCount: 6, color: '#FF7D00' },
  { id: 'g-004', name: '脊柱康复组', description: '腰椎颈椎疾病康复', patientCount: 10, color: '#722ED1' },
  { id: 'g-005', name: '慢病管理组', description: '慢性病居家康复', patientCount: 15, color: '#F53F3F' },
];

const patientNames = [
  '张伟明', '李秀英', '王桂花', '刘志强', '陈淑芬', '杨建国', '赵美玲', '黄志明',
  '周雅琴', '吴青松', '郑丽华', '孙海涛', '马文娟', '朱国栋', '胡秀兰',
];

const diagnoses = [
  '右膝关节置换术后',
  '脑梗死后遗症（左侧偏瘫）',
  '左肩关节肩袖修补术后',
  '腰椎间盘突出症术后',
  '颈椎病（神经根型）',
  '右股骨颈骨折术后',
  '帕金森病',
  '类风湿性关节炎',
];

export const mockPatients: Patient[] = patientNames.map((name, index) => {
  const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const stages: Array<'早期' | '中期' | '后期' | '维持期'> = ['早期', '中期', '后期', '维持期'];
  const statuses: Array<'active' | 'paused' | 'discharged'> = ['active', 'active', 'active', 'active', 'paused', 'discharged'];
  const daysAgo = Math.floor(Math.random() * 120);
  const lastCheckinDaysAgo = Math.floor(Math.random() * 5);
  
  return {
    id: `p-${1000 + index}`,
    name,
    age: 45 + Math.floor(Math.random() * 40),
    gender: index % 3 === 0 ? '女' : '男',
    phone: `138${(10000000 + Math.floor(Math.random() * 89999999)).toString().slice(0, 8)}`,
    diagnosis: diagnoses[index % diagnoses.length],
    surgeryDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    riskLevel: riskLevels[index % 3],
    groupId: `g-00${(index % 5) + 1}`,
    stage: stages[index % 4],
    joinDate: new Date(Date.now() - (daysAgo + 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: statuses[index % 6],
    checkinStreak: Math.floor(Math.random() * 14),
    lastCheckinDate: lastCheckinDaysAgo > 3 ? undefined : new Date(Date.now() - lastCheckinDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    medicalHistory: ['高血压', '糖尿病'].slice(0, Math.floor(Math.random() * 2) + 1),
    familyMembers: index % 2 === 0 ? [
      { id: `fm-${index}`, name: '家属' + (index + 1), relation: index % 2 === 0 ? '配偶' : '子女', phone: '139xxxxxxx', authCode: `AUTH${1000 + index}`, isActive: true },
    ] : [],
  };
});

export const mockExercises: Exercise[] = [
  {
    id: 'ex-001',
    name: '直腿抬高训练',
    description: '仰卧位，双腿伸直轮流抬高，保持膝关节伸直',
    targetArea: '大腿肌群、髋屈肌',
    difficulty: 'easy',
    defaultSets: 3,
    defaultReps: 15,
    duration: '10-15分钟',
    tips: ['保持腰部贴紧床面', '动作缓慢有控制', '避免腰部代偿'],
  },
  {
    id: 'ex-002',
    name: '膝关节被动屈伸',
    description: '在辅助下进行膝关节屈伸活动，逐步增加活动范围',
    targetArea: '膝关节',
    difficulty: 'medium',
    defaultSets: 3,
    defaultReps: 10,
    duration: '15-20分钟',
    tips: ['动作幅度以不引起明显疼痛为度', '每个角度停留3-5秒', '可配合CPM机使用'],
  },
  {
    id: 'ex-003',
    name: '股四头肌等长收缩',
    description: '坐位或仰卧位，用力绷紧大腿前侧肌肉',
    targetArea: '股四头肌',
    difficulty: 'easy',
    defaultSets: 5,
    defaultReps: 10,
    duration: '5-10分钟',
    tips: ['每次收缩保持5-10秒', '放松2-3秒再进行下一次', '感觉大腿肌肉绷紧发热即可'],
  },
  {
    id: 'ex-004',
    name: '桥式运动',
    description: '仰卧屈膝，双脚踩床，用力将臀部抬起',
    targetArea: '臀大肌、腰背部',
    difficulty: 'medium',
    defaultSets: 3,
    defaultReps: 12,
    duration: '10分钟',
    tips: ['收紧臀部再抬腰', '保持躯干伸直', '抬起后保持3秒'],
  },
  {
    id: 'ex-005',
    name: '肩关节外展训练',
    description: '站立或坐位，手臂从身体侧方慢慢抬起',
    targetArea: '三角肌、肩袖肌群',
    difficulty: 'medium',
    defaultSets: 3,
    defaultReps: 12,
    duration: '10-15分钟',
    tips: ['可用弹力带辅助', '避免耸肩代偿', '手臂不要超过90度（早期）'],
  },
  {
    id: 'ex-006',
    name: '爬墙练习',
    description: '面对墙壁站立，手指沿墙面慢慢向上爬行',
    targetArea: '肩关节活动度',
    difficulty: 'easy',
    defaultSets: 3,
    defaultReps: 10,
    duration: '10分钟',
    tips: ['手指发力而非手臂发力', '每天记录最高位置', '达到最大角度时停留5秒'],
  },
  {
    id: 'ex-007',
    name: '平衡站立训练',
    description: '双脚并拢站立，双手可扶握保持平衡',
    targetArea: '平衡能力、下肢肌力',
    difficulty: 'hard',
    defaultSets: 3,
    defaultReps: 1,
    duration: '5-10分钟',
    tips: ['身旁需有可扶握物', '逐步减少辅助', '闭眼增加难度（需有人看护）'],
  },
  {
    id: 'ex-008',
    name: '踝泵运动',
    description: '踝关节用力做跖屈和背伸动作',
    targetArea: '小腿肌群、踝关节',
    difficulty: 'easy',
    defaultSets: 5,
    defaultReps: 20,
    duration: '5分钟',
    tips: ['动作幅度要充分', '每个方向停留2秒', '预防下肢深静脉血栓'],
  },
];

export const mockPrescriptions: Prescription[] = [
  {
    id: 'pres-001',
    patientId: 'p-1000',
    patientName: '张伟明',
    name: '膝关节置换术后第一阶段处方',
    exercises: [
      { exerciseId: 'ex-008', exerciseName: '踝泵运动', sets: 5, reps: 20, order: 1 },
      { exerciseId: 'ex-003', exerciseName: '股四头肌等长收缩', sets: 5, reps: 10, order: 2 },
      { exerciseId: 'ex-001', exerciseName: '直腿抬高训练', sets: 3, reps: 15, order: 3 },
    ],
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    frequency: '每日2次，早晚各一次',
    painSurveyConfig: { enabled: true, type: 'NRS', frequency: 'every_checkin' },
    createdAt: '2026-05-31',
    doctorName: '王建国',
    status: 'active',
  },
  {
    id: 'pres-002',
    patientId: 'p-1001',
    patientName: '李秀英',
    name: '脑卒中偏瘫综合康复',
    exercises: [
      { exerciseId: 'ex-004', exerciseName: '桥式运动', sets: 3, reps: 12, order: 1 },
      { exerciseId: 'ex-007', exerciseName: '平衡站立训练', sets: 3, reps: 1, order: 2 },
      { exerciseId: 'ex-001', exerciseName: '直腿抬高训练', sets: 3, reps: 15, order: 3 },
    ],
    startDate: '2026-05-15',
    endDate: '2026-07-15',
    frequency: '每日1次',
    painSurveyConfig: { enabled: true, type: 'NRS', frequency: 'daily' },
    createdAt: '2026-05-14',
    doctorName: '王建国',
    status: 'active',
  },
  {
    id: 'pres-003',
    patientId: 'p-1002',
    patientName: '王桂花',
    name: '肩袖术后康复计划',
    exercises: [
      { exerciseId: 'ex-006', exerciseName: '爬墙练习', sets: 3, reps: 10, order: 1 },
      { exerciseId: 'ex-005', exerciseName: '肩关节外展训练', sets: 3, reps: 12, order: 2 },
    ],
    startDate: '2026-06-05',
    endDate: '2026-08-05',
    frequency: '每日2次',
    painSurveyConfig: { enabled: true, type: 'VAS', frequency: 'every_checkin' },
    createdAt: '2026-06-04',
    doctorName: '王建国',
    status: 'active',
  },
];

export const mockCheckins: Checkin[] = [
  {
    id: 'ck-001',
    patientId: 'p-1000',
    patientName: '张伟明',
    date: '2026-06-15',
    time: '08:30',
    videoThumbnail: undefined,
    exercisesCompleted: [
      { exerciseId: 'ex-008', exerciseName: '踝泵运动', completed: true, quality: 5, notes: '动作到位' },
      { exerciseId: 'ex-003', exerciseName: '股四头肌等长收缩', completed: true, quality: 4, notes: '保持时间略短' },
      { exerciseId: 'ex-001', exerciseName: '直腿抬高训练', completed: true, quality: 4 },
    ],
    painLevel: 2,
    status: 'pending',
  },
  {
    id: 'ck-002',
    patientId: 'p-1001',
    patientName: '李秀英',
    date: '2026-06-15',
    time: '09:15',
    videoThumbnail: undefined,
    exercisesCompleted: [
      { exerciseId: 'ex-004', exerciseName: '桥式运动', completed: true, quality: 3, notes: '腰部代偿明显' },
      { exerciseId: 'ex-007', exerciseName: '平衡站立训练', completed: false, notes: '无法独立完成' },
    ],
    painLevel: 3,
    abnormalFeedback: '患侧腿感到麻木，站立不稳',
    status: 'pending',
  },
  {
    id: 'ck-003',
    patientId: 'p-1002',
    patientName: '王桂花',
    date: '2026-06-15',
    time: '07:45',
    videoThumbnail: undefined,
    exercisesCompleted: [
      { exerciseId: 'ex-006', exerciseName: '爬墙练习', completed: true, quality: 5 },
      { exerciseId: 'ex-005', exerciseName: '肩关节外展训练', completed: true, quality: 5 },
    ],
    painLevel: 1,
    status: 'approved',
    doctorFeedback: '动作标准，继续保持！',
    reviewedAt: '2026-06-15 10:00',
    reviewedBy: '王建国',
  },
  {
    id: 'ck-004',
    patientId: 'p-1003',
    patientName: '刘志强',
    date: '2026-06-14',
    time: '20:00',
    videoThumbnail: undefined,
    exercisesCompleted: [
      { exerciseId: 'ex-001', exerciseName: '直腿抬高训练', completed: true, quality: 4 },
      { exerciseId: 'ex-004', exerciseName: '桥式运动', completed: true, quality: 4 },
    ],
    painLevel: 0,
    status: 'approved',
    doctorFeedback: '很好，进度不错',
    reviewedAt: '2026-06-15 09:00',
    reviewedBy: '王建国',
  },
  {
    id: 'ck-005',
    patientId: 'p-1004',
    patientName: '陈淑芬',
    date: '2026-06-14',
    time: '18:30',
    videoThumbnail: undefined,
    exercisesCompleted: [
      { exerciseId: 'ex-008', exerciseName: '踝泵运动', completed: true, quality: 2, notes: '动作幅度不足' },
    ],
    painLevel: 5,
    abnormalFeedback: '膝关节剧烈疼痛，伴有肿胀',
    status: 'pending',
  },
];

export const mockAssessments: Assessment[] = [
  {
    id: 'as-001',
    patientId: 'p-1000',
    patientName: '张伟明',
    type: 'fugl_meyer',
    typeName: 'Fugl-Meyer运动功能评分',
    date: '2026-06-14',
    scores: { '上肢功能': 28, '下肢功能': 22, '平衡功能': 10, '关节活动度': 8, '疼痛': 4 },
    totalScore: 72,
    maxScore: 100,
    summary: '下肢功能恢复良好，平衡功能需加强训练',
    doctorName: '王建国',
  },
  {
    id: 'as-002',
    patientId: 'p-1000',
    patientName: '张伟明',
    type: 'rom',
    typeName: '关节活动度评估',
    date: '2026-06-14',
    scores: {},
    totalScore: 0,
    maxScore: 0,
    romData: [
      { joint: '膝关节屈伸', side: '右', activeRange: 95, passiveRange: 105, normalRange: '0-135', unit: '°' },
      { joint: '膝关节屈伸', side: '左', activeRange: 130, passiveRange: 135, normalRange: '0-135', unit: '°' },
      { joint: '髋关节屈曲', side: '右', activeRange: 100, passiveRange: 110, normalRange: '0-120', unit: '°' },
      { joint: '踝关节背伸', side: '右', activeRange: 10, passiveRange: 15, normalRange: '0-20', unit: '°' },
    ],
    summary: '右膝关节活动度较前改善5度，继续加强被动屈伸训练',
    doctorName: '王建国',
  },
  {
    id: 'as-003',
    patientId: 'p-1001',
    patientName: '李秀英',
    type: 'berg',
    typeName: 'Berg平衡量表',
    date: '2026-06-12',
    scores: { '坐位站立': 3, '无支撑站立': 3, '无支撑坐位': 4, '站立坐下': 3, '转移': 3, '闭目站立': 2 },
    totalScore: 38,
    maxScore: 56,
    summary: '平衡功能中度受损，需加强动态平衡训练，注意防跌倒',
    doctorName: '王建国',
  },
  {
    id: 'as-004',
    patientId: 'p-1001',
    patientName: '李秀英',
    type: 'barthel',
    typeName: 'Barthel指数评定',
    date: '2026-06-12',
    scores: { '进食': 10, '洗澡': 0, '穿衣': 5, '如厕': 5, '大小便控制': 10, '上下楼梯': 0, '行走': 5 },
    totalScore: 45,
    maxScore: 100,
    summary: '日常生活活动能力中度依赖，需辅助完成个人卫生及上下楼梯',
    doctorName: '王建国',
  },
  {
    id: 'as-005',
    patientId: 'p-1000',
    patientName: '张伟明',
    type: 'stage_summary',
    typeName: '康复阶段总结（第一阶段）',
    date: '2026-06-15',
    scores: {},
    totalScore: 0,
    maxScore: 0,
    summary: '患者术后2周，膝关节主动活动度从60度改善至95度，股四头肌肌力从3级恢复至4级，疼痛VAS评分从6分降至2分。恢复进度符合预期，建议进入第二阶段康复训练，增加抗阻训练及动态平衡训练。',
    doctorName: '王建国',
  },
];

export const mockMessages: Message[] = [
  { id: 'm-001', patientId: 'p-1000', patientName: '张伟明', sender: 'patient', senderName: '张伟明', type: 'text', content: '王医生，今天训练的时候膝盖有点酸胀，正常吗？', time: '2026-06-15 10:30', isRead: false },
  { id: 'm-002', patientId: 'p-1000', patientName: '张伟明', sender: 'doctor', senderName: '王建国', type: 'text', content: '训练后轻微酸胀是正常的，记得训练后冰敷15分钟。如果出现剧烈疼痛或肿胀加重要及时告诉我。', time: '2026-06-15 10:45', isRead: true },
  { id: 'm-003', patientId: 'p-1000', patientName: '张伟明', sender: 'patient', senderName: '张伟明', type: 'text', content: '好的，谢谢王医生！', time: '2026-06-15 10:50', isRead: true },
  { id: 'm-004', patientId: 'p-1001', patientName: '李秀英', sender: 'patient', senderName: '李秀英', type: 'text', content: '医生，我最近总是头晕，是不是吃药的原因？', time: '2026-06-15 09:20', isRead: false },
  { id: 'm-005', patientId: 'p-1002', patientName: '王桂花', sender: 'patient', senderName: '王桂花', type: 'text', content: '我的爬墙练习已经能到120cm了！', time: '2026-06-15 08:00', isRead: false },
  { id: 'm-006', patientId: 'p-1005', patientName: '杨建国', sender: 'patient', senderName: '杨建国', type: 'text', content: '想预约下周的复诊', time: '2026-06-14 16:30', isRead: true },
];

export const mockAppointments: Appointment[] = [
  { id: 'ap-001', patientId: 'p-1000', patientName: '张伟明', date: '2026-06-18', time: '09:00', type: '复诊', status: 'confirmed', notes: '术后两周复查，评估膝关节ROM及肌力', createdAt: '2026-06-10' },
  { id: 'ap-002', patientId: 'p-1001', patientName: '李秀英', date: '2026-06-17', time: '10:30', type: '评估', status: 'pending', notes: '需进行Fugl-Meyer和Berg量表评估', createdAt: '2026-06-14' },
  { id: 'ap-003', patientId: 'p-1003', patientName: '刘志强', date: '2026-06-16', time: '14:00', type: '咨询', status: 'confirmed', notes: '家属陪同，讨论下一阶段训练方案', createdAt: '2026-06-12' },
  { id: 'ap-004', patientId: 'p-1002', patientName: '王桂花', date: '2026-06-20', time: '08:30', type: '复诊', status: 'pending', notes: '肩袖术后六周复查', createdAt: '2026-06-15' },
  { id: 'ap-005', patientId: 'p-1006', patientName: '赵美玲', date: '2026-06-15', time: '15:00', type: '评估', status: 'completed', notes: '已完成评估', createdAt: '2026-06-10' },
];

export const mockNotifications: NotificationItem[] = [
  { id: 'n-001', type: 'checkin', title: '待审核打卡', content: '张伟明提交了今日训练打卡，等待您的审核', time: '10分钟前', isRead: false, relatedId: 'ck-001' },
  { id: 'n-002', type: 'abnormal', title: '异常反馈提醒', content: '陈淑芬反馈膝关节剧烈疼痛伴肿胀，需要关注', time: '30分钟前', isRead: false, relatedId: 'ck-005' },
  { id: 'n-003', type: 'message', title: '新消息', content: '李秀英咨询用药后头晕的问题', time: '1小时前', isRead: false, relatedId: 'm-004' },
  { id: 'n-004', type: 'assessment', title: '评估提醒', content: '明日有2位患者需要进行康复评估', time: '2小时前', isRead: true },
  { id: 'n-005', type: 'checkin', title: '未打卡提醒', content: '杨建国连续3天未打卡，请及时提醒', time: '3小时前', isRead: true },
];

export const mockTrendData: TrendDataPoint[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000);
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    checkins: 18 + Math.floor(Math.random() * 12),
    assessments: 2 + Math.floor(Math.random() * 5),
    avgPain: 1.5 + Math.random() * 1.5,
  };
});

export const mockProgressData: ProgressDataPoint[] = [
  { date: '6/1', score: 45, category: 'Fugl-Meyer' },
  { date: '6/5', score: 52, category: 'Fugl-Meyer' },
  { date: '6/8', score: 58, category: 'Fugl-Meyer' },
  { date: '6/10', score: 63, category: 'Fugl-Meyer' },
  { date: '6/14', score: 72, category: 'Fugl-Meyer' },
  { date: '6/1', score: 60, category: '膝关节ROM' },
  { date: '6/5', score: 75, category: '膝关节ROM' },
  { date: '6/8', score: 82, category: '膝关节ROM' },
  { date: '6/10', score: 88, category: '膝关节ROM' },
  { date: '6/14', score: 95, category: '膝关节ROM' },
  { date: '6/1', score: 28, category: 'Barthel指数' },
  { date: '6/5', score: 35, category: 'Barthel指数' },
  { date: '6/8', score: 40, category: 'Barthel指数' },
  { date: '6/10', score: 42, category: 'Barthel指数' },
  { date: '6/14', score: 45, category: 'Barthel指数' },
];
