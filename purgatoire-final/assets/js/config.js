/* ── Sélecteur de guilde ──────────────────────────────────────────────────
   Stocké dans localStorage : purgatoire_guild = "1" | "2"
   Lisible depuis l'URL     : ?g=2  (prioritaire, et sauvegardé)
   ──────────────────────────────────────────────────────────────────────── */
(function() {
  const urlParam = new URLSearchParams(window.location.search).get('g');
  if (urlParam === '1' || urlParam === '2') {
    localStorage.setItem('purgatoire_guild', urlParam);
  }
  if (!localStorage.getItem('purgatoire_guild')) {
    localStorage.setItem('purgatoire_guild', '1');
  }
})();

window.getActiveGuild = function() {
  return localStorage.getItem('purgatoire_guild') || '1';
};

window.setActiveGuild = function(n) {
  localStorage.setItem('purgatoire_guild', String(n));
  window.location.reload();
};

window.PURGATOIRE_CONFIG = {
  discordInvite: "https://discord.gg/kgwNWR5M",
  googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLScxMz3iqwmYNxf3q5muZ03Wvjt3LD4QPldVqqraqCQmi8Cf5Q/viewform",
  googleFormEmbedUrl: "https://docs.google.com/forms/d/e/1FAIpQLScxMz3iqwmYNxf3q5muZ03Wvjt3LD4QPldVqqraqCQmi8Cf5Q/viewform?embedded=true",
  calendarEmbedUrl: "",
  sheets: {
    sheetId:  "1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM",
    sheetId2: "1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM",
    _base(id) { return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=`; },
    get rosterCsvUrl()    { return this._base(this.sheetId)  + "Membres"; },
    get gdgCsvUrl()       { return this._base(this.sheetId)  + "GDG"; },
    get annoncesCsvUrl()  { return this._base(this.sheetId)  + "Annonces"; },
    get absencesCsvUrl()  { return this._base(this.sheetId)  + "Absences"; },
    get tierlistCsvUrl()  { return this._base(this.sheetId)  + "Tierlist"; },
    get rosterCsvUrl2()   { return this._base(this.sheetId2) + "Membres2"; },
    get gdgCsvUrl2()      { return this._base(this.sheetId2) + "GDG2"; },
    get annoncesCsvUrl2() { return this._base(this.sheetId2) + "Annonces2"; },
    get absencesCsvUrl2() { return this._base(this.sheetId2) + "Absences2"; },
    get tierlistCsvUrl2() { return this._base(this.sheetId2) + "Tierlist2"; },
  }
};

/* Retourne les URLs de la guilde active */
window.getSheets = function() {
  const s = window.PURGATOIRE_CONFIG.sheets;
  const g = window.getActiveGuild();
  if (g === '2') return {
    rosterCsvUrl:   s.rosterCsvUrl2,
    gdgCsvUrl:      s.gdgCsvUrl2,
    annoncesCsvUrl: s.annoncesCsvUrl2,
    absencesCsvUrl: s.absencesCsvUrl2,
    tierlistCsvUrl: s.tierlistCsvUrl2,
  };
  return {
    rosterCsvUrl:   s.rosterCsvUrl,
    gdgCsvUrl:      s.gdgCsvUrl,
    annoncesCsvUrl: s.annoncesCsvUrl,
    absencesCsvUrl: s.absencesCsvUrl,
    tierlistCsvUrl: s.tierlistCsvUrl,
  };
};

/* ── Portraits de personnages ───────────────────────────────────────────── */
const HERO_BASE = '/Purgatoire/assets/images/heroes';

const _HP = {
  slot: {
    'meliodas':'slot_meliodas_001.png','king':'slot_king_001.png','diane':'slot_diane_001.png',
    'elaine':'hud_elaine_001.png','jericho':'slot_jericho_001.png','howzer':'slot_howzer_001.png',
    'griamore':'slot_griamore_001.png','dreyfus':'slot_dreyfus_001.png',
    'hendrickson':'slot_hendrickson_001.png','guila':'slot_guila_001.png',
    'gil thunder':'slot_gil_thunder_001.png','gil-thunder':'slot_gil_thunder_001.png',
    'slader':'slot_slader_001.png','tristan':'slot_tristan_001.png','manny':'slot_manny_001.png',
    'daisy':'slot_Daisy_001.png','drake':'slot_Drake_001.png','bug':'slot_bug_001.png',
    'klotho':'slot_Klotho_001.png','dreydrin':'slot_dreydrin_001.png','tioreh':'hud_tioreh_001.png',
    'arthur pendragon':'slot_arthur_pendragon_001.png','arthur':'slot_arthur_pendragon_001.png',
    'lancelot':'slot_lancelot_001.png','percival':'slot_percival_001.png',
    'nasiens':'slot_nasiens_001.png','gawain':'slot_gawain_001.png',
    'merlin':'slot_Klotho_001.png','ludociel':'slot_ludociel_001.png',
    'ban':'slot_meliodas_001.png','elizabeth':'hud_elaine_001.png',
  },
  hud: {
    'meliodas':'slot_meliodas_001.png','king':'hud_king_001.png','diane':'hud_diane_001.png',
    'elaine':'hud_elaine_001.png','jericho':'hud_jericho_001.png','howzer':'hud_howzer_001.png',
    'griamore':'hud_griamore_001.png','dreyfus':'hud_dreyfus_001.png',
    'hendrickson':'hud_hendrickson_001.png','guila':'hud_guila_001.png',
    'gil thunder':'hud_gil_thunder_001.png','gil-thunder':'hud_gil_thunder_001.png',
    'slader':'hud_slader_001.png','tristan':'slot_tristan_001.png','manny':'hud_manny_001.png',
    'daisy':'hud_Daisy_001.png','drake':'hud_Drake_001.png','bug':'hud_bug_001.png',
    'klotho':'hud_klotho_001.png','dreydrin':'hud_dreydrin_001.png','tioreh':'hud_tioreh_001.png',
    'arthur pendragon':'hud_arthur_pendragon_001.png','arthur':'hud_arthur_pendragon_001.png',
    'lancelot':'hud_lancelot_001.png','percival':'hud_percival_001.png',
    'nasiens':'hud_nasiens_001.png','gawain':'hud_gawain_001.png',
    'merlin':'hud_klotho_001.png','ludociel':'hud_ludociel_001.png',
  },
  big: {
    'meliodas':'Big_meliodas_001.png','king':'Big_king_001.png','diane':'Big_diane_001.png',
    'elaine':'Big_elaine_001.png','jericho':'Big_jericho_001.png','howzer':'Big_howzer_001.png',
    'griamore':'Big_griamore_001.png','dreyfus':'Big_dreyfus_001.png',
    'hendrickson':'Big_hendrickson_001.png','guila':'Big_guila_001.png',
    'gil thunder':'Big_gil_thunder_001.png','gil-thunder':'Big_gil_thunder_001.png',
    'slader':'Big_slader_001.png','tristan':'Big_tristan_001.png','manny':'Big_manny_001.png',
    'daisy':'Big_Daisy_001.png','drake':'Big_Drake_001.png','bug':'Big_bug_001.png',
    'klotho':'Big_Klotho_001.png','dreydrin':'Big_dreydrin_001.png','tioreh':'Big_tioreh_001.png',
    'arthur pendragon':'Big_arthur_pendragon_001.png','arthur':'Big_arthur_pendragon_001.png',
    'lancelot':'Big_lancelot_001.png','percival':'Big_percival_001.png',
    'nasiens':'Big_nasiens_001.png','gawain':'Big_gawain_001.png',
    'merlin':'Big_Klotho_001.png','ludociel':'Big_ludociel_001.png',
  },
  combine: {
    'meliodas':'Combine_Mo_meliodas_001.png','king':'Combine_Mo_king_001.png',
    'diane':'Combine_Mo_diane_001.png','elaine':'Combine_Mo_elaine_001.png',
    'jericho':'Combine_Mo_jericho_001.png','howzer':'Combine_Mo_howzer_001.png',
    'griamore':'Combine_Mo_griamore_001.png','dreyfus':'Combine_Mo_dreyfus_001.png',
    'hendrickson':'Combine_Mo_hendrickson_001.png','guila':'Combine_Mo_guila_001.png',
    'gil thunder':'Combine_Mo_gil_thunder_001.png','gil-thunder':'Combine_Mo_gil_thunder_001.png',
    'slader':'Combine_Mo_slader_001.png','tristan':'Combine_Mo_tristan_001.png',
    'manny':'Combine_Mo_manny_001.png','daisy':'Combine_Mo_Daisy_001.png',
    'drake':'Combine_Mo_Drake_001.png','bug':'Combine_Mo_bug_001.png',
    'klotho':'Combine_Mo_Klotho_001.png','dreydrin':'Combine_Mo_dreydrin_001.png',
    'tioreh':'Combine_Mo_tioreh_001.png',
    'arthur pendragon':'Combine_Mo_arthur_pendragon_001.png','arthur':'Combine_Mo_arthur_pendragon_001.png',
    'lancelot':'Combine_Mo_lancelot_001.png','percival':'Combine_Mo_percival_001.png',
    'nasiens':'Combine_Mo_nasiens_001.png','gawain':'Combine_Mo_gawain_001.png',
    'merlin':'Combine_Mo_Klotho_001.png','ludociel':'Combine_Mo_ludociel_001.png',
  }
};

window.heroPortrait = function(name, type) {
  if (!name) return '';
  const key  = String(name).toLowerCase().trim();
  const map  = _HP[type || 'slot'] || _HP.slot;
  const file = map[key];
  return file ? HERO_BASE + '/' + file : '';
};
