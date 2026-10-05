// Keep music decisions independent of playback and browser clocks.
export const MUSIC_TRACKS={
 camp:{url:'/audio/local-v2/camp.mp3',title:'方烁 · 主城',volume:.20},
 explore:{url:'/audio/local-v2/explore.mp3',title:'方烁 · 日常',volume:.18},
 forest:{url:'/audio/local-v2/forest.mp3',title:'方烁 · 轻松',volume:.18},
 ruins:{url:'/audio/local-v2/ruins.mp3',title:'方烁 · 夜晚',volume:.16},
 cultivate:{url:'/audio/local-v2/cultivate.mp3',title:'方烁 · 修炼',volume:.18},
 encounter:{url:'/audio/local-v2/encounter.mp3',title:'方烁 · 惊险',volume:.22},
 // Legacy standalone duel remains compatible, without forcing its music on the world.
 dialogue:{url:'/audio/dialogue.mp3',title:'旧版对话',volume:.20},
 battle:{url:'/audio/battle.mp3',title:'旧版斗法',volume:.22}
};
export function chooseMusic({region,threat,meditating,dead,time},memory){
 if(threat)memory.lastThreat=time;
 if(dead)return 'camp';
 if(threat||time-(memory.lastThreat??-Infinity)<5)return 'encounter';
 if(meditating)return 'cultivate';
 return {听雨驿:'camp',雾松林:'forest',照石溪:'explore',残星原:'ruins',落星台:'ruins'}[region]||'explore';
}
