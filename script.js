/* =====================================================================
   REFASHION BXL — SHARED SCRIPT
   Used by: landing-page.html, about.html, contribute.html, my-refashion.html

   This file holds everything that's genuinely common across pages:
   - The shop/initiative data (PLACES)
   - Translation strings — split into STRINGS_COMMON (identical wording
     on every page: nav labels, shared field labels) and one
     STRINGS_<PAGE> object per page for wording that's specific to that
     page's forms/content. This split matters: some pages reuse a label
     like "field_commune" for a different thing (a user's commune vs. a
     shop's commune), so those stay page-scoped to avoid one page's
     wording leaking into another's.
   - Auth / favourites / browsing history (localStorage-based prototype)
   - Analytics event stub
   - Generic modal, toast, password-toggle, and validation helpers

   Each HTML page still keeps a short inline <script> at the bottom for
   the handful of things that are genuinely page-specific (rendering the
   shop grid + map on the landing page, the profile dashboard on My
   Refashion BXL, the submission form on Add a place). That inline script
   calls into the shared functions below rather than redefining them.
   ===================================================================== */

/* ---------- SHOP / INITIATIVE DATA ---------- */
/* NOTE for the site owner: hours / instagram / website are placeholders
   where unverified. Fill in real values as you confirm each listing. */
const PLACES = [
  {id:'p1', cat:'second', name:"Mademoiselle l'Ancien", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue Haute 127, 1000 Bruxelles", hours:null, instagram:null, website:null, lat:50.8390, lng:4.3503},
  {id:'p2', cat:'second', name:"Isabelle Bajart", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue des Chartreux 25, 1000 Bruxelles", hours:null, instagram:null, website:null, lat:50.8489, lng:4.3460},
  {id:'p3', cat:'second', name:"Think Twice", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue du Vieux Marché aux Grains 57, 1000 Bruxelles", hours:null, instagram:null, website:"https://thinktwice.com", lat:50.8490, lng:4.3454},
  {id:'p4', cat:'second', name:"Endless Hits", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue de la Violette 38, 1000 Bruxelles", hours:null, instagram:null, website:null, lat:50.8451, lng:4.3528},
  {id:'p5', cat:'second', name:"Rare", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue des Riches Claires 8, 1000 Bruxelles", hours:null, instagram:null, website:null, lat:50.8464, lng:4.3480},
  {id:'p6', cat:'donate', name:"Les Petits Riens — Bd Lemonnier", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Bd Maurice Lemonnier 20, 1000 Bruxelles", hours:null, instagram:null, website:"https://petitsriens.be", lat:50.8444, lng:4.3459},
  {id:'p7', cat:'donate', name:"Les Petits Riens — Rue Haute", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue Haute 188, 1000 Bruxelles", hours:null, instagram:null, website:"https://petitsriens.be", lat:50.8378, lng:4.3496},
  {id:'p8', cat:'donate', name:"Les Petits Riens — Magasin Central", neigh:"Ixelles", addr:"Rue Américaine 101, 1050 Ixelles", hours:null, instagram:null, website:"https://petitsriens.be", lat:50.8230, lng:4.3595},
  {id:'p9', cat:'donate', name:"Les Petits Riens — Donnerie Prévôt", neigh:"Ixelles", addr:"Rue du Prévôt 30, 1050 Ixelles", hours:null, instagram:null, website:"https://petitsriens.be", lat:50.8222, lng:4.3585},
  {id:'p10', cat:'donate', name:"Les Petits Riens — Chée d'Ixelles", neigh:"Ixelles", addr:"Chaussée d'Ixelles 106, 1050 Ixelles", hours:null, instagram:null, website:"https://petitsriens.be", lat:50.8353, lng:4.3640},
  {id:'p11', cat:'upcycle', name:"R-Use Fabrik", neigh:"Ixelles", addr:"Rue du Relais 63, 1050 Ixelles", hours:null, instagram:null, website:null, lat:50.8112, lng:4.3931},
  {id:'p12', cat:'upcycle', name:"CYCLUP Mercerie", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue Haute 296C, 1000 Bruxelles", hours:null, instagram:null, website:null, lat:50.8354, lng:4.3473},
  {id:'p13', cat:'upcycle', name:"CYCLUP Atelier-Boutique", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue Haute 298c, 1000 Bruxelles", hours:null, instagram:null, website:null, lat:50.8353, lng:4.3471},
  {id:'p14', cat:'upcycle', name:"Green Fabric", neigh:"Forest", addr:"Rue Jean-Baptiste Baeck 33, 1190 Forest", hours:null, instagram:null, website:"https://greenfabric.be", lat:50.8033, lng:4.3221},
  {id:'p15', cat:'repair', name:"Gary Retouche", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue des Eperonniers 27, 1000 Bruxelles", hours:null, instagram:null, website:null, lat:50.8458, lng:4.3539},
  {id:'p16', cat:'repair', name:"Couture Clair", neigh:"Saint-Gilles", addr:"Av. Paul Dejaer 3, 1060 Saint-Gilles", hours:null, instagram:null, website:null, lat:50.8265, lng:4.3446},
  {id:'p17', cat:'repair', name:"Retouches ERMIS", neigh:"Ixelles", addr:"Av. Adolphe Buyl 46, 1050 Ixelles", hours:null, instagram:null, website:null, lat:50.8174, lng:4.3811},
  {id:'p18', cat:'repair', name:"Gold Fingers Abdel", neigh:"Bruxelles (Ville de Bruxelles)", addr:"Rue de la Bonté 2, 1000 Bruxelles", hours:null, instagram:null, website:null, lat:50.8316, lng:4.3588}
];
const MARKER_COLOR = {second:'#3E7CB1', donate:'#5C8A3A', upcycle:'#C77B2E', repair:'#A34B6F'};
/* ---------- SUPABASE (real backend) ---------- */
const SUPABASE_URL = 'https://taimxnyiapwdwsgoxcat.supabase.co';
const SUPABASE_ANON_KEY = sb_publishable_9gp_15goY-jRSPvMylJaGQ_L-8YlXEf

let _supabaseClient = null;
function getSupabase(){
  if (SUPABASE_URL.includes('YOUR_PROJECT') || !window.supabase) return null;
  if (!_supabaseClient) _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabaseClient;
}

async function fetchApprovedPlaces(){
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('places').select('*');
  if (error){ console.error('[supabase]', error); return []; }
  return data || [];
}
const BRUSSELS_COMMUNES = [
  'Anderlecht','Auderghem','Berchem-Sainte-Agathe','Bruxelles (Ville de Bruxelles)','Etterbeek','Evere',
  'Forest','Ganshoren','Ixelles','Jette','Koekelberg','Molenbeek-Saint-Jean','Saint-Gilles',
  'Saint-Josse-ten-Noode','Schaerbeek','Uccle','Watermael-Boitsfort','Woluwe-Saint-Lambert','Woluwe-Saint-Pierre'
];

/* ---------- SAMPLE REVIEWS (prototype placeholder) ----------
   Hard-coded sample entries only, shown identically to every logged-in
   user, so the "My Reviews" section has something real to display.
   A real reviews feature requires a secure database and a real user
   account system so reviews are actually tied to the person who wrote
   them. Do not treat this array as real data. */
const SAMPLE_REVIEWS = [
  {shop:"Think Twice", rating:5, text:"Great selection and very fair prices.", date:"2026-03-02"},
  {shop:"Retouches ERMIS", rating:4, text:"Fixed my zipper same day, very friendly.", date:"2026-02-11"}
];

/* ---------- SAMPLE CONTRIBUTIONS (prototype placeholder) ----------
   A few hard-coded sample rows with varied statuses, so the "My
   Contributions" section can demonstrate what each status badge looks
   like. Real contributions come from the Add a place form and are
   merged in below by matching the logged-in user's email — but moving
   a submission between Pending review / Approved / Needs more
   information / Rejected requires a moderator reviewing it on a real
   back end, which doesn't exist in this prototype. */
const SAMPLE_CONTRIBUTIONS = [
  {placeName:"Vintage Corner", category:"second", commune:"Schaerbeek", submittedAt:1739500000000, status:"approved"},
  {placeName:"Repair Hub Flagey", category:"repair", commune:"Ixelles", submittedAt:1741000000000, status:"needs_info"}
];

/* ---------- TRANSLATIONS ---------- */
/* Shared across every page — identical wording everywhere. */
const STRINGS_COMMON = {
  en:{
    nav_home:"Home", nav_about:"About", nav_add:"Add a place",
    nav_login:"Log in", nav_signup:"Sign up", nav_account:"My Account",
    pw_show:"SHOW", pw_hide:"HIDE",
    field_password:"Password", field_confirm:"Confirm password", field_lastname:"Last name",
    err_email:"Please enter a valid email address.", err_password:"Password cannot be empty.",
    err_confirm:"Passwords do not match."
  },
  fr:{
    nav_home:"Accueil", nav_about:"À propos", nav_add:"Ajouter un lieu",
    nav_login:"Se connecter", nav_signup:"S'inscrire", nav_account:"Mon compte",
    pw_show:"AFFICHER", pw_hide:"MASQUER",
    field_password:"Mot de passe", field_confirm:"Confirmer le mot de passe", field_lastname:"Nom de famille",
    err_email:"Veuillez saisir une adresse email valide.", err_password:"Le mot de passe ne peut pas être vide.",
    err_confirm:"Les mots de passe ne correspondent pas."
  },
  nl:{
    nav_home:"Home", nav_about:"Over ons", nav_add:"Voeg een plek toe",
    nav_login:"Inloggen", nav_signup:"Registreren", nav_account:"Mijn account",
    pw_show:"TONEN", pw_hide:"VERBERGEN",
    field_password:"Wachtwoord", field_confirm:"Bevestig wachtwoord", field_lastname:"Achternaam",
    err_email:"Voer een geldig e-mailadres in.", err_password:"Wachtwoord mag niet leeg zijn.",
    err_confirm:"Wachtwoorden komen niet overeen."
  }
};

const STRINGS_LANDING = {
  en:{
    tagline:"Refashion BXL — your circular guide to Brussels",
    hero_text:"Four stops in the life of a garment, mapped across Brussels: find a second-hand shop to give a piece its second wardrobe, drop off the clothes you no longer wear so they can start a new journey, discover upcycling workshops that give an old pair of jeans, shirt or jacket a whole new story, or finally repair that bag, zipper or favourite piece you promised yourself you'd fix months ago. Browse by category or explore by neighbourhood and keep your clothes in the loop.",
    hero_cta:"Browse the map",
    search_placeholder:"Search a shop or initiative by name…",
    chip_all:"All", chip_second:"Second-hand", chip_donate:"Donation", chip_upcycle:"Upcycling", chip_repair:"Repairs",
    neigh_all:"All communes",
    legend_second:"Second-hand", legend_donate:"Donation", legend_upcycle:"Upcycling", legend_repair:"Repairs",
    view_details:"View details →",
    contact_title:"Have something in mind?",
    contact_text:"Whether it's a question, an idea, feedback or a suggestion to make Refashion BXL better, I'd love to hear from you. Drop me a message at refashionbxl@gmail.com and let's keep improving the loop together.",
    locked_eyebrow:"Members only", locked_title:"Log in or create your account",
    locked_text:"Log in or create your free Refashion BXL account to view full place details, get directions and save your favourite spots.",
    locked_login:"Log in", locked_create:"Create an account", locked_close:"Close",
    detail_directions:"Get directions", detail_fav:"Save to favourites", detail_unfav:"Remove from favourites",
    signup_eyebrow:"Join Refashion BXL", signup_title:"Create your free account", signup_submit:"Create account",
    field_username:"Username", field_email:"Email address", field_commune:"Your Brussels commune",
    terms_label:"I accept the Privacy Policy and Terms and Conditions.",
    err_username:"Please enter a username.", err_terms:"You must accept the Privacy Policy and Terms and Conditions.",
    already_account:"Already have an account?", new_to_site:"New to Refashion BXL?",
    login_eyebrow:"Welcome back", login_title:"Log in to Refashion BXL", login_submit:"Log in",
    forgot_password:"Forgot your password?", err_notfound:"No account found with this email — create one instead?",
    toast_saved:"Saved to favourites", toast_removed:"Removed from favourites", toast_created:"Account created — welcome!", toast_loggedin:"Logged in — welcome back!",
    hours_soon:"Coming soon",
    teaser_about_title:"About this map", teaser_about_text:"Refashion BXL is a collaborative, interactive map to repair, donate, upcycle and buy second-hand clothes in your own neighbourhood.", teaser_about_btn:"Learn more",
    teaser_add_title:"Add a place", teaser_add_text:"Know a circular-fashion place that should be on the map? Share the details with us.", teaser_add_btn:"Add a place",
    teaser_my_title:"My Refashion BXL", teaser_my_text:"Log in or create a free account to save your favourite places and view your profile.", teaser_my_btn:"My Refashion BXL"
  },
  fr:{
    tagline:"Refashion BXL — votre guide circulaire à Bruxelles",
    hero_text:"Quatre étapes dans la vie d'un vêtement, cartographiées à travers Bruxelles : trouvez une friperie pour donner une seconde vie à une pièce, déposez les vêtements que vous ne portez plus pour qu'ils entament un nouveau voyage, découvrez des ateliers d'upcycling qui redonnent une nouvelle histoire à un jean, une chemise ou une veste, ou enfin réparez ce sac, cette fermeture éclair ou cette pièce préférée que vous vouliez arranger depuis des mois. Parcourez par catégorie ou par quartier et gardez vos vêtements dans la boucle.",
    hero_cta:"Explorer la carte",
    search_placeholder:"Rechercher une boutique ou une initiative par nom…",
    chip_all:"Tous", chip_second:"Seconde main", chip_donate:"Don", chip_upcycle:"Upcycling", chip_repair:"Réparation",
    neigh_all:"Toutes les communes",
    legend_second:"Seconde main", legend_donate:"Don", legend_upcycle:"Upcycling", legend_repair:"Réparation",
    view_details:"Voir les détails →",
    contact_title:"Une idée en tête ?",
    contact_text:"Qu'il s'agisse d'une question, d'une idée, d'un retour ou d'une suggestion pour améliorer Refashion BXL, j'aimerais beaucoup vous entendre. Écrivez-moi à refashionbxl@gmail.com et continuons à améliorer la boucle ensemble.",
    locked_eyebrow:"Réservé aux membres", locked_title:"Connectez-vous ou créez un compte",
    locked_text:"Connectez-vous ou créez votre compte Refashion BXL gratuit pour voir les détails complets, obtenir un itinéraire et enregistrer vos lieux favoris.",
    locked_login:"Se connecter", locked_create:"Créer un compte", locked_close:"Fermer",
    detail_directions:"Obtenir l'itinéraire", detail_fav:"Ajouter aux favoris", detail_unfav:"Retirer des favoris",
    signup_eyebrow:"Rejoindre Refashion BXL", signup_title:"Créez votre compte gratuit", signup_submit:"Créer le compte",
    field_username:"Nom d'utilisateur", field_email:"Adresse email", field_commune:"Votre commune bruxelloise",
    terms_label:"J'accepte la Politique de confidentialité et les Conditions générales.",
    err_username:"Veuillez saisir un nom d'utilisateur.", err_terms:"Vous devez accepter la Politique de confidentialité et les Conditions générales.",
    already_account:"Vous avez déjà un compte ?", new_to_site:"Nouveau sur Refashion BXL ?",
    login_eyebrow:"Content de vous revoir", login_title:"Connexion à Refashion BXL", login_submit:"Se connecter",
    forgot_password:"Mot de passe oublié ?", err_notfound:"Aucun compte trouvé avec cet email — en créer un ?",
    toast_saved:"Ajouté aux favoris", toast_removed:"Retiré des favoris", toast_created:"Compte créé — bienvenue !", toast_loggedin:"Connecté — bon retour !",
    hours_soon:"Bientôt disponible",
    teaser_about_title:"À propos de cette carte", teaser_about_text:"Refashion BXL est une carte collaborative et interactive pour réparer, donner, upcycler et acheter des vêtements de seconde main dans votre quartier.", teaser_about_btn:"En savoir plus",
    teaser_add_title:"Ajouter un lieu", teaser_add_text:"Vous connaissez un lieu de mode circulaire qui devrait figurer sur la carte ? Partagez les détails avec nous.", teaser_add_btn:"Ajouter un lieu",
    teaser_my_title:"Mon Refashion BXL", teaser_my_text:"Connectez-vous ou créez un compte gratuit pour enregistrer vos lieux favoris et voir votre profil.", teaser_my_btn:"Mon Refashion BXL"
  },
  nl:{
    tagline:"Refashion BXL — jouw circulaire gids voor Brussel",
    hero_text:"Vier stappen in het leven van een kledingstuk, in kaart gebracht doorheen Brussel: vind een tweedehandswinkel om een stuk een tweede leven te geven, breng kleren die je niet meer draagt naar een inzamelpunt zodat ze een nieuwe reis beginnen, ontdek upcyclingateliers die een oude spijkerbroek, hemd of jas een gloednieuw verhaal geven, of herstel eindelijk die tas, rits of favoriete stuk dat je maanden geleden al wilde laten repareren. Filter op categorie of ontdek per buurt en houd je kleren in de kringloop.",
    hero_cta:"Bekijk de kaart",
    search_placeholder:"Zoek een winkel of initiatief op naam…",
    chip_all:"Alle", chip_second:"Tweedehands", chip_donate:"Inzameling", chip_upcycle:"Upcycling", chip_repair:"Herstelling",
    neigh_all:"Alle gemeenten",
    legend_second:"Tweedehands", legend_donate:"Inzameling", legend_upcycle:"Upcycling", legend_repair:"Herstelling",
    view_details:"Bekijk details →",
    contact_title:"Heb je iets op je hart?",
    contact_text:"Of het nu een vraag, idee, feedback of suggestie is om Refashion BXL te verbeteren, ik hoor het graag. Stuur een bericht naar refashionbxl@gmail.com en laten we de kringloop samen blijven verbeteren.",
    locked_eyebrow:"Enkel voor leden", locked_title:"Log in of maak een account",
    locked_text:"Log in of maak je gratis Refashion BXL-account om volledige details te bekijken, een routebeschrijving te krijgen en je favoriete plekken op te slaan.",
    locked_login:"Inloggen", locked_create:"Account aanmaken", locked_close:"Sluiten",
    detail_directions:"Routebeschrijving", detail_fav:"Toevoegen aan favorieten", detail_unfav:"Verwijderen uit favorieten",
    signup_eyebrow:"Word lid van Refashion BXL", signup_title:"Maak je gratis account", signup_submit:"Account aanmaken",
    field_username:"Gebruikersnaam", field_email:"E-mailadres", field_commune:"Jouw Brusselse gemeente",
    terms_label:"Ik aanvaard het Privacybeleid en de Algemene Voorwaarden.",
    err_username:"Voer een gebruikersnaam in.", err_terms:"Je moet het Privacybeleid en de Algemene Voorwaarden aanvaarden.",
    already_account:"Heb je al een account?", new_to_site:"Nieuw bij Refashion BXL?",
    login_eyebrow:"Welkom terug", login_title:"Inloggen bij Refashion BXL", login_submit:"Inloggen",
    forgot_password:"Wachtwoord vergeten?", err_notfound:"Geen account gevonden met dit e-mailadres — er een aanmaken?",
    toast_saved:"Toegevoegd aan favorieten", toast_removed:"Verwijderd uit favorieten", toast_created:"Account aangemaakt — welkom!", toast_loggedin:"Ingelogd — welkom terug!",
    hours_soon:"Binnenkort beschikbaar",
    teaser_about_title:"Over deze kaart", teaser_about_text:"Refashion BXL is een collaboratieve, interactieve kaart om kleding te herstellen, doneren, upcyclen en tweedehands te kopen in je eigen buurt.", teaser_about_btn:"Meer weten",
    teaser_add_title:"Voeg een plek toe", teaser_add_text:"Ken je een circulaire-modeplek die op de kaart zou moeten staan? Deel de details met ons.", teaser_add_btn:"Voeg een plek toe",
    teaser_my_title:"Mijn Refashion BXL", teaser_my_text:"Log in of maak een gratis account om je favoriete plekken op te slaan en je profiel te bekijken.", teaser_my_btn:"Mijn Refashion BXL"
  }
};

const STRINGS_ABOUT = {
  en:{
    about_eyebrow:"About this map", about_title:"A map made to keep clothes in use",
    about_lead:"Refashion BXL is a collaborative and interactive map helping people repair, donate, upcycle and buy second-hand clothes in their own neighbourhood — one stop at a time, so fewer garments end up in the bin.",
    about_mission_title:"Why this matters",
    about_mission_text:"Every year, huge amounts of clothing are thrown away while still wearable — often simply because people don't know where nearby to sell, donate, mend, or transform a piece instead. Brussels already has a rich network of second-hand shops, donation points, repair counters and upcycling workshops. They're just scattered and hard to find in one place. Refashion BXL brings them together on a single, simple map so keeping clothes in circulation becomes the easy choice, not the hard one.",
    about_community_title:"Built with the community, for the community",
    about_community_text:"This map started small and grows with every person who adds a spot they know and trust. If there's a repair shop, swap event, or donation point missing from Brussels, you can suggest it directly — every submission is reviewed before it goes live, so the map stays accurate and useful for everyone.",
    about_cta_text:"Know a place that should be on this map?", about_cta_btn:"Contribute a place"
  },
  fr:{
    about_eyebrow:"À propos de cette carte", about_title:"Une carte pour garder les vêtements en circulation",
    about_lead:"Refashion BXL est une carte collaborative et interactive qui aide les gens à réparer, donner, upcycler et acheter des vêtements de seconde main dans leur propre quartier — un lieu à la fois, pour que moins de vêtements finissent à la poubelle.",
    about_mission_title:"Pourquoi c'est important",
    about_mission_text:"Chaque année, d'énormes quantités de vêtements sont jetées alors qu'ils sont encore portables — souvent simplement parce que les gens ne savent pas où, près de chez eux, les vendre, les donner, les réparer ou les transformer. Bruxelles dispose déjà d'un riche réseau de friperies, points de don, ateliers de réparation et d'upcycling. Ils sont simplement dispersés et difficiles à trouver au même endroit. Refashion BXL les réunit sur une seule carte simple pour que garder ses vêtements en circulation devienne le choix facile, pas le choix compliqué.",
    about_community_title:"Construite avec et pour la communauté",
    about_community_text:"Cette carte a démarré petit et grandit grâce à chaque personne qui ajoute un lieu qu'elle connaît et en qui elle a confiance. S'il manque une friperie, un événement d'échange ou un point de don à Bruxelles, vous pouvez le proposer directement — chaque contribution est vérifiée avant publication, afin que la carte reste fiable et utile pour tous.",
    about_cta_text:"Vous connaissez un lieu qui devrait figurer sur cette carte ?", about_cta_btn:"Proposer un lieu"
  },
  nl:{
    about_eyebrow:"Over deze kaart", about_title:"Een kaart om kleding in gebruik te houden",
    about_lead:"Refashion BXL is een collaboratieve en interactieve kaart die mensen helpt kleding te herstellen, doneren, upcyclen en tweedehands te kopen in hun eigen buurt — stap voor stap, zodat minder kledingstukken in de vuilnisbak eindigen.",
    about_mission_title:"Waarom dit belangrijk is",
    about_mission_text:"Elk jaar wordt enorm veel kleding weggegooid terwijl ze nog draagbaar is — vaak simpelweg omdat mensen niet weten waar ze in de buurt een stuk kunnen verkopen, doneren, herstellen of transformeren. Brussel heeft al een rijk netwerk van tweedehandswinkels, inzamelpunten, herstelateliers en upcyclingateliers. Ze zijn alleen verspreid en moeilijk op één plek te vinden. Refashion BXL brengt ze samen op één eenvoudige kaart, zodat kleding in circulatie houden de makkelijke keuze wordt, niet de moeilijke.",
    about_community_title:"Gebouwd met en voor de gemeenschap",
    about_community_text:"Deze kaart begon klein en groeit met elke persoon die een plek toevoegt die ze kennen en vertrouwen. Ontbreekt er een herstelwinkel, ruilevenement of inzamelpunt in Brussel? Stel het gerust voor — elke bijdrage wordt gecontroleerd voordat ze online komt, zodat de kaart accuraat en nuttig blijft voor iedereen.",
    about_cta_text:"Kent u een plek die op deze kaart zou moeten staan?", about_cta_btn:"Draag een plek voor"
  }
};

const STRINGS_CONTRIBUTE = {
  en:{
    contrib_title:"Add a place to the map",
    contrib_lead:"Know a circular-fashion place that should be on the map? Share the details with us.",
    contrib_info:"Every suggestion is reviewed before being added to the Refashion BXL map.",
    contrib_place_name:"Name of the place", contrib_category:"Category", contrib_optional:"Optional",
    contrib_submit:"Send for review",
    contrib_thanks_title:"Thank you!",
    contrib_thanks_1:"Your suggestion has been received and will be reviewed before it appears on the map.",
    field_commune:"Brussels neighbourhood or commune", field_address:"Address", field_email:"Contributor email address",
    field_website:"Website", field_instagram:"Instagram link", field_description:"Short description",
    cat_repair:"Repairs", cat_upcycle:"Upcycling", cat_second:"Second-hand", cat_donate:"Donation"
  },
  fr:{
    contrib_title:"Ajouter un lieu à la carte",
    contrib_lead:"Vous connaissez un lieu de mode circulaire qui devrait figurer sur la carte ? Partagez les détails avec nous.",
    contrib_info:"Chaque suggestion est vérifiée avant d'être ajoutée à la carte Refashion BXL.",
    contrib_place_name:"Nom du lieu", contrib_category:"Catégorie", contrib_optional:"Optionnel",
    contrib_submit:"Envoyer pour vérification",
    contrib_thanks_title:"Merci !",
    contrib_thanks_1:"Votre suggestion a été reçue et sera vérifiée avant d'apparaître sur la carte.",
    field_commune:"Quartier ou commune bruxelloise", field_address:"Adresse", field_email:"Email du contributeur",
    field_website:"Site web", field_instagram:"Lien Instagram", field_description:"Courte description",
    cat_repair:"Réparation", cat_upcycle:"Upcycling", cat_second:"Seconde main", cat_donate:"Don"
  },
  nl:{
    contrib_title:"Voeg een plek toe aan de kaart",
    contrib_lead:"Ken je een circulaire-modeplek die op de kaart zou moeten staan? Deel de details met ons.",
    contrib_info:"Elke suggestie wordt gecontroleerd voordat ze aan de Refashion BXL-kaart wordt toegevoegd.",
    contrib_place_name:"Naam van de plek", contrib_category:"Categorie", contrib_optional:"Optioneel",
    contrib_submit:"Verzenden voor controle",
    contrib_thanks_title:"Bedankt!",
    contrib_thanks_1:"Je voorstel is ontvangen en wordt gecontroleerd voordat het op de kaart verschijnt.",
    field_commune:"Brusselse buurt of gemeente", field_address:"Adres", field_email:"E-mailadres van indiener",
    field_website:"Website", field_instagram:"Instagram-link", field_description:"Korte beschrijving",
    cat_repair:"Herstelling", cat_upcycle:"Upcycling", cat_second:"Tweedehands", cat_donate:"Inzameling"
  }
};

const STRINGS_MYREFASHION = {
  en:{
    cat_second:"Second-hand", cat_donate:"Donation", cat_upcycle:"Upcycling", cat_repair:"Repairs",
    signup_eyebrow:"Join Refashion BXL", signup_title:"Create your free account", signup_submit:"Create account",
    login_eyebrow:"Welcome back", login_title:"Log in to Refashion BXL", login_submit:"Log in",
    login_notfound:"No account found with this email — create one instead?",
    field_name:"Name", field_email:"Email", field_commune:"Where do you live?", field_other:"Outside Brussels",
    err_name:"Please enter your name.", err_lastname:"Please enter your last name.",
    loggedout_title:"Your personal circular fashion space", loggedout_text:"Create a free account to save favourite spots and manage your Refashion BXL profile.",
    loggedout_create:"Create an account", loggedout_login:"Log in",

    /* Profile header */
    member_since:"Member since", edit_profile:"Edit profile", save_profile:"Save",
    bio_placeholder:"Add a short sentence about you (max 100 characters)…",

    /* Community summary */
    summary_saved:"Saved places", summary_reviews:"Reviews", summary_contrib:"Contributions",

    /* Saved places */
    fav_title:"My Saved Places", fav_empty:"No saved places yet — heart a place from the map to save it here.",
    fav_remove:"Remove",

    /* Reviews */
    reviews_title:"My Reviews", reviews_empty:"No reviews yet.",

    /* Contributions */
    contrib_title:"My Contributions", contrib_empty:"No contributions yet — suggest a place from the Add a place page.",
    status_pending:"Pending review", status_approved:"Approved", status_needs_info:"Needs more information", status_rejected:"Rejected",

    /* Settings */
    settings_title:"Settings", settings_language:"Preferred language", settings_password:"Change password", settings_password_note:"Changing your password requires a secure back end — not available in this prototype.",
    logout:"Log out", toast_saved:"Profile updated", toast_created:"Account created — welcome!", toast_loggedin:"Logged in — welcome back!"
  },
  fr:{
    cat_second:"Seconde main", cat_donate:"Don", cat_upcycle:"Upcycling", cat_repair:"Réparation",
    signup_eyebrow:"Rejoindre Refashion BXL", signup_title:"Créez votre compte gratuit", signup_submit:"Créer le compte",
    login_eyebrow:"Content de vous revoir", login_title:"Connexion à Refashion BXL", login_submit:"Se connecter",
    login_notfound:"Aucun compte trouvé avec cet email — en créer un ?",
    field_name:"Prénom", field_email:"Email", field_commune:"Où habitez-vous ?", field_other:"Hors de Bruxelles",
    err_name:"Veuillez indiquer votre prénom.", err_lastname:"Veuillez indiquer votre nom.",
    loggedout_title:"Votre espace mode circulaire personnel", loggedout_text:"Créez un compte gratuit pour enregistrer vos lieux favoris et gérer votre profil Refashion BXL.",
    loggedout_create:"Créer un compte", loggedout_login:"Se connecter",

    member_since:"Membre depuis", edit_profile:"Modifier le profil", save_profile:"Enregistrer",
    bio_placeholder:"Ajoutez une courte phrase à propos de vous (max 100 caractères)…",

    summary_saved:"Lieux enregistrés", summary_reviews:"Avis", summary_contrib:"Contributions",

    fav_title:"Mes lieux enregistrés", fav_empty:"Pas encore de lieu enregistré — ajoutez un cœur à un lieu depuis la carte pour l'enregistrer ici.",
    fav_remove:"Retirer",

    reviews_title:"Mes avis", reviews_empty:"Pas encore d'avis.",

    contrib_title:"Mes contributions", contrib_empty:"Pas encore de contribution — proposez un lieu depuis la page Ajouter un lieu.",
    status_pending:"En cours de vérification", status_approved:"Approuvé", status_needs_info:"Informations manquantes", status_rejected:"Refusé",

    settings_title:"Paramètres", settings_language:"Langue préférée", settings_password:"Changer le mot de passe", settings_password_note:"Changer votre mot de passe nécessite un back-end sécurisé — non disponible dans ce prototype.",
    logout:"Se déconnecter", toast_saved:"Profil mis à jour", toast_created:"Compte créé — bienvenue !", toast_loggedin:"Connecté — bon retour !"
  },
  nl:{
    cat_second:"Tweedehands", cat_donate:"Inzameling", cat_upcycle:"Upcycling", cat_repair:"Herstelling",
    signup_eyebrow:"Word lid van Refashion BXL", signup_title:"Maak je gratis account", signup_submit:"Account aanmaken",
    login_eyebrow:"Welkom terug", login_title:"Inloggen bij Refashion BXL", login_submit:"Inloggen",
    login_notfound:"Geen account gevonden met dit e-mailadres — er een aanmaken?",
    field_name:"Voornaam", field_email:"E-mail", field_commune:"Waar woon je?", field_other:"Buiten Brussel",
    err_name:"Voer je voornaam in.", err_lastname:"Voer je achternaam in.",
    loggedout_title:"Jouw persoonlijke circulaire modewereld", loggedout_text:"Maak een gratis account om favoriete plekken op te slaan en je Refashion BXL-profiel te beheren.",
    loggedout_create:"Account aanmaken", loggedout_login:"Inloggen",

    member_since:"Lid sinds", edit_profile:"Profiel bewerken", save_profile:"Opslaan",
    bio_placeholder:"Voeg een korte zin over jezelf toe (max 100 tekens)…",

    summary_saved:"Opgeslagen plekken", summary_reviews:"Reviews", summary_contrib:"Bijdragen",

    fav_title:"Mijn opgeslagen plekken", fav_empty:"Nog geen opgeslagen plekken — klik op het hartje bij een plek op de kaart om het hier op te slaan.",
    fav_remove:"Verwijderen",

    reviews_title:"Mijn reviews", reviews_empty:"Nog geen reviews.",

    contrib_title:"Mijn bijdragen", contrib_empty:"Nog geen bijdragen — stel een plek voor via de pagina Voeg een plek toe.",
    status_pending:"In controle", status_approved:"Goedgekeurd", status_needs_info:"Meer informatie nodig", status_rejected:"Afgewezen",

    settings_title:"Instellingen", settings_language:"Voorkeurstaal", settings_password:"Wachtwoord wijzigen", settings_password_note:"Je wachtwoord wijzigen vereist een beveiligde back-end — niet beschikbaar in dit prototype.",
    logout:"Uitloggen", toast_saved:"Profiel bijgewerkt", toast_created:"Account aangemaakt — welkom!", toast_loggedin:"Ingelogd — welkom terug!"
  }
};

/* Merge common + page-specific strings for the current language.
   Usage on each page: const dict = pageDict(STRINGS_LANDING); */
function pageDict(pageStrings){
  return Object.assign({}, STRINGS_COMMON[getLang()], pageStrings[getLang()]);
}

/* ---------- LANGUAGE ---------- */
function getLang(){ return localStorage.getItem('refashion_lang') || 'en'; }

/* ---------- ANALYTICS (stub) ---------- */
/* Replace this function's body with a real Google Analytics / Plausible
   call later. Every meaningful user action already fires a named event. */
window.dataLayer = window.dataLayer || [];
function track(eventName, detail){
  window.dataLayer.push({event: eventName, ...detail});
  console.log('[analytics]', eventName, detail || {});
}

/* ---------- AUTH ---------- */
/* PROTOTYPE ONLY, NOT SECURE. Passwords are validated client-side for
   realistic UX but are NEVER stored anywhere, not even hashed. Real
   registration, login, password storage, password reset, purchase
   history, and cross-device favourites all require a secure back end
   (e.g. Supabase, Firebase, or a custom server with proper password
   hashing) — none of that exists yet. */
function getUser(){ return JSON.parse(localStorage.getItem('refashion_user') || 'null'); }
function isLoggedIn(){ return !!getUser(); }
function saveUser(u){ localStorage.setItem('refashion_user', JSON.stringify(u)); } // never includes a password
function logout(){ localStorage.removeItem('refashion_user'); location.reload(); }

/* ---------- FAVOURITES ---------- */
function getFavourites(){ return JSON.parse(localStorage.getItem('refashion_favourites') || '[]'); }
function toggleFavourite(id){
  let favs = getFavourites();
  const already = favs.includes(id);
  favs = already ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem('refashion_favourites', JSON.stringify(favs));
  track('favourite_toggle', {place_id:id, saved: !already});
  return !already;
}

/* ---------- ICONS ---------- */
function iconInstagram(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>`; }
function iconHeart(filled){
  const stroke = filled ? '#FF6B4A' : 'currentColor';
  const fill = filled ? '#FF6B4A' : 'none';
  return `<svg viewBox="0 0 24 24" style="stroke:${stroke};fill:${fill};"><path d="M12 21s-7.5-4.6-10-9.2C.6 8.2 2.4 4.8 6 4.2c2-.3 3.9.6 5 2.3 1.1-1.7 3-2.6 5-2.3 3.6.6 5.4 4 3.9 7.6C19.5 16.4 12 21 12 21z"/></svg>`;
}

/* ---------- MODALS ---------- */
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
/* Call once per page (after the modal HTML exists) to wire the generic
   close behaviours: the × button, any [data-close] button, and clicking
   the dark overlay outside the card. */
function wireModalCloseHandlers(){
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
  });
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.remove('open'); });
  });
}

/* ---------- PASSWORD SHOW/HIDE TOGGLES ---------- */
/* Call once per page. getDict should return that page's current merged
   dictionary so the SHOW/HIDE label stays in the right language. */
function wirePasswordToggles(getDict){
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.getAttribute('data-toggle'));
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      const dict = getDict();
      btn.textContent = showing ? dict.pw_show : dict.pw_hide;
    });
  });
}

/* ---------- VALIDATION ---------- */
function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function setError(fieldId, show){
  const err = document.getElementById('err-'+fieldId), input = document.getElementById(fieldId);
  if (err) err.classList.toggle('show', show);
  if (input) input.classList.toggle('error', show);
}

/* ---------- TOAST ---------- */
function showToast(msg){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 2200);
}
