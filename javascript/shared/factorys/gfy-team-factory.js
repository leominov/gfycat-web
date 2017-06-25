angular.module('gfycat.shared').factory('gfyTeamFactory', function() {
  var teamMembers = [
    {
      "name": "Dan McEleney",
      "accountName": "@danno",
      "bio": "Dan is one of our co-founders and manages most of the day-to-day operations of Gfycat. He operates out of Edmonton and has extensive experience in IT and client management. An avid redditor, Dan’s frustration with the low-quality, slow-loading GIFs he saw on reddit led to the creation of Gfycat.",
      "gfyId": "ImaginaryKindIcefish"
    },
    {
      "name": "Jeff Harris",
      "accountName": "@jeffrey",
      "bio": "Jeff is one of our co-founders. He is intensely mysterious and does not show up in photographs. His whereabouts are a closely-guarded secret. Jeff graduated from the University of Alberta with a double major in physics and film and has never lost an argument to Dan about lighting, colors and time lapses.",
      "gfyId": "RaggedRequiredKentrosaurus"
    },
    {
      "name": "Richard Rabbat",
      "accountName": "@ricardricard",
      "bio": "Richard Rabbat, Gfycat’s CEO, received his PhD from MIT before taking positions at Fujistu, Google, Zynga, and Tango. At Google, Richard led the “Make the Web Faster” initiative, which led to the creation of new web standards including HTTP 2.0 and WebP, a new image format for the web. During his stint at Zynga, he managed the client platform team that developed api.zynga.com. As VP of Platform and Advertising at Tango, he ran business operations for the gaming and ad verticals. In his spare time, he runs marathons",
      "gfyId": "AcademicWatchfulCatbird"
    },
    {
      "name": "Ceda Andelkovic",
      "accountName": "@soniku",
      "bio": "Ceda is a Senior Software Engineer and our resident vampire. His hobbies include avoiding the sun, gaming, running, and swimming. A minimalist and avid learner who’s lived on three continents before joining us at our Edmonton office, he’s definitely better traveled than you and probably cooler too.",
      "gfyId": "AgitatedThatFox"
    },
    {
      "name": "Kenny Au",
      "accountName": "@kennethjeremyau",
      "bio": "Kenny, one of our Senior Software Engineers, is a true Canadian—a former competitive figure skater, he walks to work even in sub-zero (Fahrenheit) temperatures. In his free time he designs video games, writes, and plays guitar. Before joining us in our Edmonton office, he worked at Haemonetics, Willowglen Systems, and Care1, as well as a few of his own startups. He graduated from the University of Alberta.",
      "gfyId": "LankyTeemingFawn"
    },
    {
      "name": "Miles Shang",
      "accountName": "@mshang",
      "bio": "Miles is a Software Developer. Originally from Vancouver, he graduated from McGill and has worked at Facebook and Instagram before joining us in Edmonton. He loves film photography and traveling, and uses the Dvorak keyboard layout for some reason.",
      "gfyId": "IllinformedRelievedGordonsetter"
    },
    {
      "name": "Josh Kang",
      "accountName": "@kngroo",
      "bio": "Josh, a Senior Software Engineer, practices bushcraft (it’s a real thing, look it up), plays the cello, and tinkers in his spare time. Previously he’s worked at Samsung and graduated from the University of Toronto.",
      "gfyId": "DefensivePlaintiveHylaeosaurus"
    },
    {
      "name": "Maria Meteleva",
      "accountName": "@alaska",
      "bio": "Maria, or Masha, is a Software Engineer from Moscow, with a degree from Moscow Institute of Physics and Technology and experience in natural language processing and front end developing. She loves raccoons and hates tap water. Her favorite programming language is C++, and she plays guitar (but only when no one can hear).",
      "gfyId": "VapidGaseousBeaver"
    },
    {
      "name": "Patrick Rogers",
      "accountName": "@patrick_",
      "bio": "Patrick is a beer enthusiast and Mac loyalist who loves running, watching soccer, and learning German. A graduate of Virginia Tech and UNC, he recently joined us as a Senior Software Engineer in Mountain View.",
      "gfyId": "MisguidedWarpedJenny"
    },
    {
      "name": "Peter Kucharski",
      "accountName": "@voxelated",
      "bio": "Peter (Piotr) was born in Poland, raised in Pennsylvania, and graduated from Waseda University in Japan.  Our web developer, he’s passionate about “making GIFs jiffier” and writing music, from rock to electronic to “post-anything.” His spirit animal is the Asiatic Black Bear.",
      "gfyId": "ShadyPlushDevilfish"
    },
    {
      "name": "Hanna Xu",
      "accountName": "@hannax",
      "bio": "With an affinity for tech and post-pc devices, Hanna is our Senior Product Designer. An avid redditor, she can be found surfing r/corgi or attempting to take cute pictures of her dog Kitkat (named after the Android’s OS). Before Gfycat, Hanna co-founded a TechCrunch featured messaging app, led core-communications at Tango, and was lead designer at another early stage startup now acquired by Wish. She graduated from Washington University in St. Louis.",
      "gfyId": "EachNastyBirdofparadise"
    },
    {
      "name": "Amanda Lorei",
      "accountName": "@aml1992",
      "bio": "Amanda is our Communications Manager. She recently graduated from Stanford and loves reading and hiking (but usually not at the same time), as well as speaking bad Russian to Masha. Her darkest secret is that she loves animal GIFs but hates actual animals. Her favorite subreddit is r/woahdude.",
      "gfyId": "SnoopyGlossyFlycatcher"
    },
    {
      "name": "John Dodini",
      "accountName": "@johnd",
      "bio": "John is an avid sports and entertainment fan whose wardrobe consists almost exclusively of v-necks. Born and raised in the East Bay, he's been in Silicon Valley the last 7+ years. He heads up all business development for Gfycat. John's previous stints include Singularity and security tech startup Wickr. He graduated from Stanford.",
      "gfyId": "SillyJampackedIceblueredtopzebra"
    },
    {
      "name": "Vera Yuan",
      "accountName": "@verbear",
      "bio": "Vera is an amateur impersonator with a knack for mimicking acquaintances and famous people. She’s part princess and part drill sergeant, and is a Lagree fitness instructor on her free time. She has a degree from Pepperdine and worked at Tango Me before joining us as our Partner and Product Operations Manager.",
      "gfyId": "FaintMatureFlickertailsquirrel"
    },
    {
      "name": "Mike Wei",
      "accountName": "@routediscovered",
      "bio": "Mike is our Data Scientist. Hailing originally from Nova Scotia, Mike graduated from Stanford University and has previously worked at Tango, Glu Mobile, and LinkedIn. He enjoys tap-dancing and sharing anime recommendations with his desk buddy Daniel.",
      "gfyId": "GivingDopeyHart"
    },
    {
      "name": "Dave Constantin",
      "accountName": "@scribetree",
      "bio": "Dave is our Head of Social Media. Formerly of Funny Or Die, he spends his nights sleeplessly tending to his newborn daughter and his weekends skydiving, hiking, and terrorizing the neighbors with his ridiculous drumming habit.",
      "gfyId": "WastefulBlueIguanodon"
    },
    {
      "name": "Daniel Estrada",
      "accountName": "@dashingdanny",
      "bio": "Daniel is our Content Intern. He lives his life 7-15 seconds at a time, and firmly believes that GIF/MP4/webM are the superior media formats. He has a passion for industrial strength bubble wrap, energy drinks with warning labels written in fonts too small to read, and painfully awkward introductions. He fancies himself a GIF smith, mouse as his hammer, Gfycat his sturdy anvil. He is a veteran of the USMC.",
      "gfyId": "CloseSmoothBorderterrier"
    },
    {
      "name": "Henry Gan",
      "accountName": "@henrygan",
      "bio": "Henry, our Software Engineering Intern, is a recent graduate of the University of California who hails originally from New Jersey. He’s an expert fantasy football player who loves board games and anime/manga. In his free time he moderates a Madden subreddit.",
      "gfyId": "MistyNaiveAdeliepenguin"
    }
  ];

  return teamMembers;
});
