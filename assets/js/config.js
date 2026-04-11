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
