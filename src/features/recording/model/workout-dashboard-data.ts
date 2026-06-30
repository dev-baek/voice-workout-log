export const weeklyMetrics = [
  { label: '이번 주 운동', value: '3회' },
  { label: '총 세트', value: '28세트' },
  { label: '총 볼륨', value: '8.4t' },
] as const;

export const recentWorkouts = [
  {
    name: '벤치프레스',
    detail: '60kg / 10회 x 3세트',
    total: '총 30회',
  },
  {
    name: '스쿼트',
    detail: '80kg / 5회 x 5세트',
    total: '총 25회',
  },
  {
    name: '랫풀다운',
    detail: '45kg / 12회 x 4세트',
    total: '총 48회',
  },
] as const;

export const muscleVolumes = [
  { label: '가슴', value: 82 },
  { label: '하체', value: 68 },
  { label: '등', value: 54 },
] as const;
