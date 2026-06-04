/**
 * 공용 랜덤 유틸리티 함수
 */

export const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
export const randomFloat = (options: number[]): number => randomPick(options);
