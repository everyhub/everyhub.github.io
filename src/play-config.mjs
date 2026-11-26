import { wishTreeSection } from './information.mjs';
import { utilitySections } from './utility-config.mjs';

export const playPath = 'play/';
export const playTools = [
  ['new-year-countdown', '2027 새해 카운트다운', '한국 시간으로 2027년 새해까지 남은 시간을 확인해 보세요.', ['카운트다운', '새해', '신년', '2027', '디데이']],
  ['resolution-card', '새해 다짐 카드', '새해에 지키고 싶은 다짐을 한 장의 이미지로 남겨 보세요.', ['새해', '다짐', '목표', '카드', 'png']],
  ['secret-santa', '마니또·비밀 산타 뽑기', '자기 자신이 걸리지 않게 짝을 정하고, 각자 받을 이름만 확인하세요.', ['마니또', '비밀 산타', '크리스마스', '랜덤', '짝']],
  ['year-in-review', '올해 돌아보기', '기억에 남는 순간과 나에게 하고 싶은 말을 한 장에 담아 보세요.', ['회고', '연말', '올해', '기록', '카드']],
  ['roulette', '랜덤 뽑기·룰렛', '고르기 어려울 때 후보를 적고 룰렛을 돌려 하나를 뽑아 보세요.', ['랜덤', '뽑기', '룰렛', '당첨', '메뉴']],
  ['zodiac-age', '띠·만 나이 계산', '양력 생일로 설날 기준 띠와 생일 기준 만 나이를 확인하세요.', ['띠', '십이지', '정미년', '양띠', '설날']],
  ['team-draw', '랜덤 팀 나누기', '참가자를 섞어 인원 차이가 최대 한 명인 팀을 만드세요.', ['팀 나누기', '조 편성', '팀 배정', '랜덤', '팀짜기']],
].map(([id, name, description, keywords]) => ({ id, path: `play/${id}/`, name, description, keywords }));

export const ladderPath = 'tools/ladder-draw/';
export const playItems = [wishTreeSection, ...playTools, utilitySections.find(({ path }) => path === ladderPath)];
