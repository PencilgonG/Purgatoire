window.PURGATOIRE_CONFIG = {
  discordInvite: "https://discord.gg/kgwNWR5M",
  googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLScxMz3iqwmYNxf3q5muZ03Wvjt3LD4QPldVqqraqCQmi8Cf5Q/viewform",
  googleFormEmbedUrl: "https://docs.google.com/forms/d/e/1FAIpQLScxMz3iqwmYNxf3q5muZ03Wvjt3LD4QPldVqqraqCQmi8Cf5Q/viewform?embedded=true",
  calendarEmbedUrl: "",
  sheets: {
    sheetId: "1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM",
    get base()          { return `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&sheet=`; },
    get rosterCsvUrl()  { return this.base + "Membres"; },
    get gdgCsvUrl()     { return this.base + "GDG"; },
    get annoncesCsvUrl(){ return this.base + "Annonces"; },
    get absencesCsvUrl(){ return this.base + "Absences"; },
    get tierlistCsvUrl(){ return this.base + "Tierlist"; },
  }
};

/* ── Portraits de personnages ───────────────────────────────────────────── */
const HERO_BASE = '/Purgatoire/assets/images/heroes';
const ELEM_BASE = '/Purgatoire/assets/images/elements';

const _HP = {
  slot: {
    /* ── Seven Deadly Sins : Origin (assets officiels du jeu) ── */
    'meliodas':    'slot_meliodas_001.png',
    'king':        'slot_king_001.png',
    'diane':       'slot_diane_001.png',
    'elaine':      'hud_elaine_001.png',
    'jericho':     'slot_jericho_001.png',
    'howzer':      'slot_howzer_001.png',
    'griamore':    'slot_griamore_001.png',
    'dreyfus':     'slot_dreyfus_001.png',
    'hendrickson': 'slot_hendrickson_001.png',
    'guila':       'slot_guila_001.png',
    'gil thunder': 'slot_gil_thunder_001.png',
    'gil-thunder': 'slot_gil_thunder_001.png',
    'slader':      'slot_slader_001.png',
    'tristan':     'slot_tristan_001.png',
    'manny':       'slot_manny_001.png',
    'daisy':       'slot_Daisy_001.png',
    'drake':       'slot_Drake_001.png',
    'bug':         'slot_bug_001.png',
    'klotho':      'slot_Klotho_001.png',
    'dreydrin':    'slot_dreydrin_001.png',
    'tioreh':      'hud_tioreh_001.png',
    /* ── Four Knights of the Apocalypse (portraits générés) ── */
    'arthur pendragon': 'slot_arthur_pendragon_001.png',
    'arthur':           'slot_arthur_pendragon_001.png',
    'lancelot':         'slot_lancelot_001.png',
    'percival':         'slot_percival_001.png',
    'nasiens':          'slot_nasiens_001.png',
    'gawain':           'slot_gawain_001.png',
    'merlin':           'slot_Klotho_001.png',   // Merlin = Klotho dans Origin
    'ludociel':         'slot_ludociel_001.png',
    /* ── Aliases quiz ── */
    'ban':              'slot_meliodas_001.png',  // fallback si Ban absent
    'elizabeth':        'hud_elaine_001.png',     // fallback
  },
  hud: {
    /* ── SDS : Origin ── */
    'meliodas':    'slot_meliodas_001.png',
    'king':        'hud_king_001.png',
    'diane':       'hud_diane_001.png',
    'elaine':      'hud_elaine_001.png',
    'jericho':     'hud_jericho_001.png',
    'howzer':      'hud_howzer_001.png',
    'griamore':    'hud_griamore_001.png',
    'dreyfus':     'hud_dreyfus_001.png',
    'hendrickson': 'hud_hendrickson_001.png',
    'guila':       'hud_guila_001.png',
    'gil thunder': 'hud_gil_thunder_001.png',
    'gil-thunder': 'hud_gil_thunder_001.png',
    'slader':      'hud_slader_001.png',
    'tristan':     'slot_tristan_001.png',
    'manny':       'hud_manny_001.png',
    'daisy':       'hud_Daisy_001.png',
    'drake':       'hud_Drake_001.png',
    'bug':         'hud_bug_001.png',
    'klotho':      'hud_klotho_001.png',
    'dreydrin':    'hud_dreydrin_001.png',
    'tioreh':      'hud_tioreh_001.png',
    /* ── FKOA ── */
    'arthur pendragon': 'hud_arthur_pendragon_001.png',
    'arthur':           'hud_arthur_pendragon_001.png',
    'lancelot':         'hud_lancelot_001.png',
    'percival':         'hud_percival_001.png',
    'nasiens':          'hud_nasiens_001.png',
    'gawain':           'hud_gawain_001.png',
    'merlin':           'hud_klotho_001.png',
    'ludociel':         'hud_ludociel_001.png',
  },
  big: {
    /* ── SDS : Origin ── */
    'meliodas':    'Big_meliodas_001.png',   'king':    'Big_king_001.png',
    'diane':       'Big_diane_001.png',      'elaine':  'Big_elaine_001.png',
    'jericho':     'Big_jericho_001.png',    'howzer':  'Big_howzer_001.png',
    'griamore':    'Big_griamore_001.png',   'dreyfus': 'Big_dreyfus_001.png',
    'hendrickson': 'Big_hendrickson_001.png','guila':   'Big_guila_001.png',
    'gil thunder': 'Big_gil_thunder_001.png','gil-thunder':'Big_gil_thunder_001.png',
    'slader':      'Big_slader_001.png',     'tristan': 'Big_tristan_001.png',
    'manny':       'Big_manny_001.png',      'daisy':   'Big_Daisy_001.png',
    'drake':       'Big_Drake_001.png',      'bug':     'Big_bug_001.png',
    'klotho':      'Big_Klotho_001.png',     'dreydrin':'Big_dreydrin_001.png',
    'tioreh':      'Big_tioreh_001.png',
    /* ── FKOA ── */
    'arthur pendragon': 'Big_arthur_pendragon_001.png',
    'arthur':           'Big_arthur_pendragon_001.png',
    'lancelot':         'Big_lancelot_001.png',
    'percival':         'Big_percival_001.png',
    'nasiens':          'Big_nasiens_001.png',
    'gawain':           'Big_gawain_001.png',
    'merlin':           'Big_Klotho_001.png',
    'ludociel':         'Big_ludociel_001.png',
  },
  combine: {
    /* ── SDS : Origin ── */
    'meliodas':    'Combine_Mo_meliodas_001.png',  'king':    'Combine_Mo_king_001.png',
    'diane':       'Combine_Mo_diane_001.png',     'elaine':  'Combine_Mo_elaine_001.png',
    'jericho':     'Combine_Mo_jericho_001.png',   'howzer':  'Combine_Mo_howzer_001.png',
    'griamore':    'Combine_Mo_griamore_001.png',  'dreyfus': 'Combine_Mo_dreyfus_001.png',
    'hendrickson': 'Combine_Mo_hendrickson_001.png','guila':  'Combine_Mo_guila_001.png',
    'gil thunder': 'Combine_Mo_gil_thunder_001.png','gil-thunder':'Combine_Mo_gil_thunder_001.png',
    'slader':      'Combine_Mo_slader_001.png',    'tristan': 'Combine_Mo_tristan_001.png',
    'manny':       'Combine_Mo_manny_001.png',     'daisy':   'Combine_Mo_Daisy_001.png',
    'drake':       'Combine_Mo_Drake_001.png',     'bug':     'Combine_Mo_bug_001.png',
    'klotho':      'Combine_Mo_Klotho_001.png',    'dreydrin':'Combine_Mo_dreydrin_001.png',
    'tioreh':      'Combine_Mo_tioreh_001.png',
    /* ── FKOA ── */
    'arthur pendragon': 'Combine_Mo_arthur_pendragon_001.png',
    'arthur':           'Combine_Mo_arthur_pendragon_001.png',
    'lancelot':         'Combine_Mo_lancelot_001.png',
    'percival':         'Combine_Mo_percival_001.png',
    'nasiens':          'Combine_Mo_nasiens_001.png',
    'gawain':           'Combine_Mo_gawain_001.png',
    'merlin':           'Combine_Mo_Klotho_001.png',
    'ludociel':         'Combine_Mo_ludociel_001.png',
  }
};

/** Retourne l'URL portrait d'un personnage. type: 'slot'|'hud'|'big'|'combine' */
window.heroPortrait = function(name, type) {
  if (!name) return '';
  const key = String(name).toLowerCase().trim();
  const map = _HP[type || 'slot'] || _HP.slot;
  const file = map[key];
  return file ? HERO_BASE + '/' + file : '';
};
