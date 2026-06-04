/**
 * Narrative Generator - AI 없이 서사/배경/성격을 템플릿 기반으로 생성
 */

import { randomPick } from '../utils/randomUtils';
import { generateAllAbilities } from './abilityGenerator';

interface NarrativeInput {
  name?: string;
  race?: string;
  backstory?: string;
  appearance?: string;
  combatStyle?: string;
  personality?: string;
}

const RACE_POOL_KO = ['인간', '엘프', '드워프', '하프링', '오크', '티플링', '드래곤본', '노움'];
const RACE_POOL_EN = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Tiefling', 'Dragonborn', 'Gnome'];

const NAME_PREFIXES_KO = ['용맹한', '그림자', '은빛', '붉은', '검은', '푸른', '황금', '철의', '폭풍의', '달빛'];
const NAME_SUFFIXES_KO = ['카엘', '리온', '아란', '세르', '드락', '미라', '엘라', '쏜', '레이', '벡스'];
const NAME_PREFIXES_EN = ['Brave', 'Shadow', 'Silver', 'Red', 'Black', 'Blue', 'Golden', 'Iron', 'Storm', 'Moon'];
const NAME_SUFFIXES_EN = ['kael', 'rion', 'aran', 'ser', 'drak', 'mira', 'ella', 'thorn', 'ray', 'vex'];

const BACKSTORY_TEMPLATES_KO = [
  "{name}은(는) {origin}에서 태어나 {event}를 겪은 후, {goal}을(를) 위해 모험을 떠났습니다.",
  "어린 시절 {event}를 목격한 {name}은(는) {goal}을(를) 맹세하고 {origin}을(를) 떠났습니다.",
  "{origin} 출신의 {name}은(는) {event} 이후 삶의 의미를 찾아 방랑하게 되었습니다.",
];

const BACKSTORY_TEMPLATES_EN = [
  "{name} was born in {origin} and after {event}, set out on an adventure to {goal}.",
  "After witnessing {event} as a child, {name} swore to {goal} and left {origin}.",
  "Hailing from {origin}, {name} began wandering in search of meaning after {event}.",
];

const ORIGINS_KO = ['작은 마을', '번화한 도시', '깊은 숲', '산악 요새', '해안 마을', '사막 오아시스', '지하 동굴'];
const ORIGINS_EN = ['a small village', 'a bustling city', 'the deep forest', 'a mountain fortress', 'a coastal town', 'a desert oasis', 'underground caverns'];

const EVENTS_KO = ['가족을 잃는 비극', '신비로운 힘의 각성', '배신당한 경험', '전쟁의 참화', '스승과의 만남', '저주에 걸림'];
const EVENTS_EN = ['losing their family', 'awakening mysterious powers', 'being betrayed', 'the horrors of war', 'meeting a mentor', 'being cursed'];

const GOALS_KO = ['진정한 힘을 찾기', '잃어버린 것을 되찾기', '세상을 구하기', '복수를 완수하기', '자신의 운명을 알기', '평화를 가져오기'];
const GOALS_EN = ['find true power', 'reclaim what was lost', 'save the world', 'complete their revenge', 'discover their destiny', 'bring peace'];

const APPEARANCE_TEMPLATES_KO = [
  "{height}의 {build} 체형으로, {feature1}과(와) {feature2}가 특징입니다.",
  "{build} 체형에 {feature1}를 가진 {height}. {feature2}가 인상적입니다.",
];

const APPEARANCE_TEMPLATES_EN = [
  "A {height} figure with a {build} build, notable for {feature1} and {feature2}.",
  "{height} with a {build} frame, bearing {feature1}. {feature2} stands out.",
];

const HEIGHTS_KO = ['장신', '평균 키', '단신', '거구', '날씬한 체구'];
const HEIGHTS_EN = ['tall', 'average height', 'short', 'imposing', 'slender'];

const BUILDS_KO = ['근육질', '날렵한', '건장한', '호리호리한', '다부진'];
const BUILDS_EN = ['muscular', 'agile', 'sturdy', 'lean', 'compact'];

const FEATURES_KO = ['날카로운 눈매', '흉터 자국', '특이한 문신', '은빛 머리카락', '붉은 눈동자', '뾰족한 귀', '두꺼운 갑옷', '낡은 망토'];
const FEATURES_EN = ['sharp eyes', 'scarred features', 'unusual tattoos', 'silver hair', 'red eyes', 'pointed ears', 'heavy armor', 'a worn cloak'];

const COMBAT_STYLES_KO = [
  "주로 {weapon}을(를) 사용하며, {tactic} 전술을 선호합니다.",
  "{tactic}에 능하며, {weapon}을(를) 자유자재로 다룹니다.",
];

const COMBAT_STYLES_EN = [
  "Primarily wields {weapon}, preferring {tactic} tactics.",
  "Excels at {tactic}, handling {weapon} with mastery.",
];

const WEAPONS_KO = ['장검', '쌍검', '대검', '활', '지팡이', '도끼', '창', '단검', '마법'];
const WEAPONS_EN = ['a longsword', 'dual blades', 'a greatsword', 'a bow', 'a staff', 'an axe', 'a spear', 'daggers', 'magic'];

const TACTICS_KO = ['정면 돌파', '기습과 암살', '원거리 저격', '방어와 반격', '마법 공세', '교란과 혼란'];
const TACTICS_EN = ['frontal assault', 'ambush and assassination', 'ranged sniping', 'defense and counter', 'magical offense', 'disruption and chaos'];

const PERSONALITIES_KO = [
  "{trait1}하지만 {trait2}한 면도 있습니다. {quirk}",
  "{trait1}한 성격으로, 종종 {quirk} {trait2}한 모습을 보이기도 합니다.",
];

const PERSONALITIES_EN = [
  "Generally {trait1}, but also has a {trait2} side. {quirk}",
  "Known for being {trait1}, though often shows {trait2} tendencies. {quirk}",
];

const TRAITS1_KO = ['냉철', '정의로운', '호탕', '신중', '호기심 많은', '과묵'];
const TRAITS1_EN = ['calm and calculated', 'righteous', 'boisterous', 'cautious', 'curious', 'taciturn'];

const TRAITS2_KO = ['따뜻', '잔인', '유머러스', '감성적', '무모', '충성스러운'];
const TRAITS2_EN = ['warm', 'ruthless', 'humorous', 'emotional', 'reckless', 'loyal'];

const QUIRKS_KO = ['독특한 취미가 있으며,', '과거에 대해 말하기 꺼리며,', '동료에게는 다정하며,', '약자를 보면 못 지나치며,'];
const QUIRKS_EN = ['Has an unusual hobby.', 'Reluctant to speak of the past.', 'Gentle with companions.', 'Cannot ignore the weak.'];

const ANECDOTE_TEMPLATES_KO = [
  "한 번은 {situation}에서 {action}하여 {result}한 적이 있습니다.",
  "{situation} 때, {name}은(는) {action}했습니다. {result}",
];

const ANECDOTE_TEMPLATES_EN = [
  "Once, in {situation}, they {action}, resulting in {result}.",
  "During {situation}, {name} {action}. {result}",
];

const SITUATIONS_KO = ['위기 상황', '술집에서의 시비', '몬스터와의 조우', '마을 축제', '험난한 여정 중'];
const SITUATIONS_EN = ['a crisis', 'a tavern brawl', 'an encounter with monsters', 'a village festival', 'a perilous journey'];

const ACTIONS_KO = ['혼자서 맞서', '기지를 발휘해', '동료를 구하기 위해 뛰어들어', '예상치 못한 행동으로'];
const ACTIONS_EN = ['stood alone against the threat', 'used quick thinking', 'dove in to save a companion', 'acted unexpectedly'];

const RESULTS_KO = ['모두를 놀라게 했습니다', '전설이 되었습니다', '깊은 인상을 남겼습니다', '큰 교훈을 얻었습니다'];
const RESULTS_EN = ['surprising everyone', 'becoming a legend', 'leaving a lasting impression', 'learning a valuable lesson'];

const ANECDOTE_TITLES_KO = ['그날의 기억', '전해지는 이야기', '잊지 못할 순간', '숨겨진 일화', '알려지지 않은 과거'];
const ANECDOTE_TITLES_EN = ['A Memory of That Day', 'A Tale Often Told', 'An Unforgettable Moment', 'A Hidden Story', 'The Unknown Past'];

/**
 * 서사 요소 생성 (AI 없이 템플릿 기반)
 */
export function generateNarrative(input: NarrativeInput, language: 'ko' | 'en') {
  const isKo = language === 'ko';
  
  // 이름 생성
  const name = input.name || (isKo 
    ? `${randomPick(NAME_PREFIXES_KO)} ${randomPick(NAME_SUFFIXES_KO)}`
    : `${randomPick(NAME_PREFIXES_EN)}${randomPick(NAME_SUFFIXES_EN)}`
  );
  
  // 종족
  const race = input.race || randomPick(isKo ? RACE_POOL_KO : RACE_POOL_EN);
  
  // 배경 이야기
  const backstory = input.backstory || (isKo 
    ? randomPick(BACKSTORY_TEMPLATES_KO)
        .replace('{name}', name)
        .replace('{origin}', randomPick(ORIGINS_KO))
        .replace('{event}', randomPick(EVENTS_KO))
        .replace('{goal}', randomPick(GOALS_KO))
    : randomPick(BACKSTORY_TEMPLATES_EN)
        .replace('{name}', name)
        .replace('{origin}', randomPick(ORIGINS_EN))
        .replace('{event}', randomPick(EVENTS_EN))
        .replace('{goal}', randomPick(GOALS_EN))
  );
  
  // 외형
  const appearance = input.appearance || (isKo
    ? randomPick(APPEARANCE_TEMPLATES_KO)
        .replace('{height}', randomPick(HEIGHTS_KO))
        .replace('{build}', randomPick(BUILDS_KO))
        .replace('{feature1}', randomPick(FEATURES_KO))
        .replace('{feature2}', randomPick(FEATURES_KO.filter(f => f !== randomPick(FEATURES_KO))))
    : randomPick(APPEARANCE_TEMPLATES_EN)
        .replace('{height}', randomPick(HEIGHTS_EN))
        .replace('{build}', randomPick(BUILDS_EN))
        .replace('{feature1}', randomPick(FEATURES_EN))
        .replace('{feature2}', randomPick(FEATURES_EN))
  );
  
  // 전투 스타일
  const combatStyle = input.combatStyle || (isKo
    ? randomPick(COMBAT_STYLES_KO)
        .replace('{weapon}', randomPick(WEAPONS_KO))
        .replace('{tactic}', randomPick(TACTICS_KO))
    : randomPick(COMBAT_STYLES_EN)
        .replace('{weapon}', randomPick(WEAPONS_EN))
        .replace('{tactic}', randomPick(TACTICS_EN))
  );
  
  // 성격
  const personality = input.personality || (isKo
    ? randomPick(PERSONALITIES_KO)
        .replace('{trait1}', randomPick(TRAITS1_KO))
        .replace('{trait2}', randomPick(TRAITS2_KO))
        .replace('{quirk}', randomPick(QUIRKS_KO))
    : randomPick(PERSONALITIES_EN)
        .replace('{trait1}', randomPick(TRAITS1_EN))
        .replace('{trait2}', randomPick(TRAITS2_EN))
        .replace('{quirk}', randomPick(QUIRKS_EN))
  );
  
  // 성격 일화
  const personalityAnecdote = isKo
    ? randomPick(ANECDOTE_TEMPLATES_KO)
        .replace('{name}', name)
        .replace('{situation}', randomPick(SITUATIONS_KO))
        .replace('{action}', randomPick(ACTIONS_KO))
        .replace('{result}', randomPick(RESULTS_KO))
    : randomPick(ANECDOTE_TEMPLATES_EN)
        .replace('{name}', name)
        .replace('{situation}', randomPick(SITUATIONS_EN))
        .replace('{action}', randomPick(ACTIONS_EN))
        .replace('{result}', randomPick(RESULTS_EN));
  
  const personalityAnecdoteTitle = randomPick(isKo ? ANECDOTE_TITLES_KO : ANECDOTE_TITLES_EN);
  
  // 전투 일화
  const combatAnecdote = isKo
    ? randomPick(ANECDOTE_TEMPLATES_KO)
        .replace('{name}', name)
        .replace('{situation}', randomPick(SITUATIONS_KO))
        .replace('{action}', randomPick(ACTIONS_KO))
        .replace('{result}', randomPick(RESULTS_KO))
    : randomPick(ANECDOTE_TEMPLATES_EN)
        .replace('{name}', name)
        .replace('{situation}', randomPick(SITUATIONS_EN))
        .replace('{action}', randomPick(ACTIONS_EN))
        .replace('{result}', randomPick(RESULTS_EN));
  
  const combatAnecdoteTitle = randomPick(isKo ? ANECDOTE_TITLES_KO : ANECDOTE_TITLES_EN);
  
  return {
    name,
    race,
    backstory,
    appearance,
    combatStyle,
    personality,
    personalityAnecdote,
    personalityAnecdoteTitle,
    combatAnecdote,
    combatAnecdoteTitle,
  };
}

/**
 * 완전한 캐릭터 생성 (AI 없이 모든 것을 로직으로)
 */
export function generateFullCharacter(input: NarrativeInput, language: 'ko' | 'en') {
  const narrative = generateNarrative(input, language);
  const abilities = generateAllAbilities(language);
  
  return {
    ...narrative,
    ...abilities,
    imageKey: '',
    image: '',
    wins: 0,
    losses: 0,
  };
}
