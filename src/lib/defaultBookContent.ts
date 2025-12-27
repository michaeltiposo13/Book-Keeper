// Default book content generator for books without content
// This provides sample content so users can read books even if admin hasn't added content yet

export const generateDefaultContent = (title: string, author: string): string[] => {
  const pages: string[] = [];
  
  // Page 1: Title and Introduction
  pages.push(
    `${title.toUpperCase()}\n\n` +
    `by ${author}\n\n` +
    `CHAPTER 1\n\n` +
    `This is a sample reading of "${title}" by ${author}. ` +
    `The full content of this book is being prepared and will be available soon. ` +
    `In the meantime, you can enjoy this preview of the book.\n\n` +
    `The story begins in a world where knowledge and imagination come together. ` +
    `As you turn these pages, you'll discover the rich narrative that ${author} has crafted ` +
    `with care and attention to detail.\n\n` +
    `This digital edition allows you to read at your own pace, bookmark your favorite passages, ` +
    `and immerse yourself in the literary world created by the author.`
  );
  
  // Page 2: Sample narrative
  pages.push(
    `As the narrative unfolds, we find ourselves drawn into the world of the characters. ` +
    `Each page brings new insights and deeper understanding of the themes explored in this work.\n\n` +
    `The author's unique voice shines through in every paragraph, creating a reading experience ` +
    `that is both engaging and thought-provoking. The characters come to life through their ` +
    `dialogue and actions, making us care about their journeys.\n\n` +
    `Throughout this book, you'll encounter moments of tension, resolution, and discovery. ` +
    `The plot weaves together multiple threads, creating a rich tapestry of storytelling ` +
    `that keeps readers engaged from beginning to end.`
  );
  
  // Page 3: Character development
  pages.push(
    `The development of the characters is one of the most compelling aspects of this work. ` +
    `Each character has their own motivations, fears, and dreams that drive the story forward.\n\n` +
    `As we follow their journeys, we see how they grow and change in response to the challenges ` +
    `they face. These transformations are not always easy, but they are always meaningful.\n\n` +
    `The relationships between characters add depth to the narrative, showing how people ` +
    `influence each other in profound ways. These connections form the emotional core of the story.`
  );
  
  // Page 4: Themes and messages
  pages.push(
    `The themes explored in this book resonate with readers on multiple levels. ` +
    `Whether it's the search for identity, the power of friendship, or the importance of ` +
    `standing up for what's right, these ideas are woven throughout the narrative.\n\n` +
    `The author doesn't shy away from difficult topics, instead choosing to address them ` +
    `with honesty and compassion. This approach creates a reading experience that is both ` +
    `entertaining and meaningful.\n\n` +
    `As you continue reading, you'll find yourself reflecting on these themes and how they ` +
    `relate to your own experiences. This is the mark of truly great literature.`
  );
  
  // Page 5: Conclusion preview
  pages.push(
    `As we approach the conclusion of this preview, we're reminded of the journey we've taken. ` +
    `From the opening pages to this moment, the story has unfolded in ways both expected and surprising.\n\n` +
    `The full content of "${title}" will be available soon, allowing you to experience the complete ` +
    `narrative that ${author} has created. Until then, we hope this preview has given you a taste ` +
    `of what's to come.\n\n` +
    `Thank you for reading, and we look forward to sharing the complete story with you soon. ` +
    `The library is working to make the full content available to all readers.`
  );
  
  return pages;
};

// Sample content for popular books (can be expanded)
export const sampleBookContents: Record<string, string[]> = {
  "To Kill a Mockingbird": [
    "PART ONE\n\nCHAPTER 1\n\nWhen he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. When it healed, and Jem's fears of never being able to play football were assuaged, he was seldom self-conscious about his injury. His left arm was somewhat shorter than his right; when he stood or walked, the back of his hand was at right angles to his body, his thumb parallel to his thigh. He couldn't have cared less, so long as he could pass and punt.\n\nWhen enough years had gone by to enable us to look back on them, we sometimes discussed the events leading to his accident. I maintain that the Ewells started it all, but Jem, who was four years my senior, said it started long before that. He said it began the summer Dill came to us, when Dill first gave us the idea of making Boo Radley come out.",
    "I said if he wanted to take a broad view of the thing, it really began with Andrew Jackson. If General Jackson hadn't run the Creeks up the creek, Simon Finch would never have paddled up the Alabama, and where would we be if he hadn't? We were far too old to settle the argument with a fist-fight, so we consulted Atticus. Our father said we were both right.\n\nBeing Southerners, it was a source of shame to some members of the family that we had no recorded ancestors on either side of the Battle of Hastings. All we had was Simon Finch, a fur-trapping, apothecary from Cornwall whose piety was exceeded only by his stinginess. In England, Simon was irritated by the persecution of those who called themselves Methodists at the hands of their more liberal brethren, and as Simon called himself a Methodist, he worked his way across the Atlantic to Philadelphia, thence to Jamaica, thence to Mobile, and up the Saint Stephens.",
    "Mindful of John Wesley's strictures on the use of many words in buying and selling, Simon made a pile practicing medicine, but in this pursuit he was unhappy lest he be tempted into doing what he knew was not for the glory of God, as the putting on of gold and costly apparel. So Simon, having forgotten his teacher's dictum on the possession of human chattels, bought three slaves and with their aid established a homestead on the banks of the Alabama River some forty miles above Saint Stephens. He returned to Saint Stephens only once, to find a wife, and with her established a line that ran high to daughters. Simon lived to an impressive age and died rich.",
    "It was customary for the men in the family to remain on Simon's homestead, Finch's Landing, and make their living from cotton. The place was self-sufficient: modest in comparison with the empires around it, the Landing nevertheless produced everything required to sustain life except ice, wheat flour, and articles of clothing, supplied by river-boats from Mobile.\n\nSimon would have regarded with impotent fury the disturbance between the North and the South, as it left his descendants stripped of everything but their land, yet the tradition of living on the land remained unbroken until well into the twentieth century, when my father, Atticus Finch, went to Montgomery to read law, and his younger brother went to Boston to study medicine. Their sister Alexandra was the Finch who remained at the Landing: she married a taciturn man who spent most of his time lying in a hammock by the river, wondering if his trot-lines were full.",
    "When my father was admitted to the bar, he returned to Maycomb and began his practice. Maycomb, some twenty miles east of Finch's Landing, was the county seat of Maycomb County. Atticus's office in the courthouse contained little more than a hat rack, a spittoon, a checkerboard and an unsullied Code of Alabama. His first two clients were the last two persons hanged in the Maycomb County jail. Atticus had urged them to accept the state's generosity in allowing them to plead Guilty to second-degree murder and escape with their lives, but they were Haverfords, in Maycomb County a name synonymous with jackass."
  ],
  "1984": [
    "PART ONE\n\nCHAPTER 1\n\nIt was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.\n\nThe hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features. Winston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during daylight hours. It was part of the economy drive in preparation for Hate Week.",
    "The flat was seven flights up, and Winston, who was thirty-nine and had a varicose ulcer above his right ankle, went slowly, resting several times on the way. On each landing, opposite the lift-shaft, the poster with the enormous face gazed from the wall. It was one of those pictures which are so contrived that the eyes follow you about when you move. BIG BROTHER IS WATCHING YOU, the caption beneath it ran.\n\nInside the flat a fruity voice was reading out a list of figures which had something to do with the production of pig-iron. The voice came from an oblong metal plaque like a dulled mirror which formed part of the surface of the right-hand wall. Winston turned a switch and the voice sank somewhat, though the words were still distinguishable. The instrument (the telescreen, it was called) could be dimmed, but there was no way of shutting it off completely.",
    "He took a twenty-five cent piece out of his pocket. There, too, in tiny clear lettering, the same slogans were inscribed, and on the other side of the coin the head of Big Brother. Even on the coins the eyes followed you about. On coins, on stamps, on the covers of books, on banners, on posters, and on the wrapping of a cigarette packet—everywhere. Always the eyes watching you and the voice enveloping you. Asleep or awake, working or eating, indoors or out of doors, in the bath or in bed—no escape. Nothing was your own except the few cubic centimetres inside your skull.\n\nThe sun had shifted round, and the myriad windows of Victory Mansions, though the glass was all dark, formed a dazzling rectangle of sky blue. He tried to squeeze out some childhood memory that should tell him whether London had always been quite like this. Were there always these vistas of rotting nineteenth-century houses, their sides shored up with baulks of timber, their windows patched with cardboard and their roofs with corrugated iron, their crazy garden walls sagging in all directions?"
  ],
  "Pride and Prejudice": [
    "CHAPTER 1\n\nIt is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.\n\n'My dear Mr. Bennet,' said his lady to him one day, 'have you heard that Netherfield Park is let at last?'\n\nMr. Bennet replied that he had not.\n\n'But it is,' returned she; 'for Mrs. Long has just been here, and she told me all about it.'\n\nMr. Bennet made no answer.\n\n'Do you not want to know who has taken it?' cried his wife impatiently.",
    "'You want to tell me, and I have no objection to hearing it.'\n\nThis was invitation enough.\n\n'Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.'\n\n'What is his name?'\n\n'Bingley.'\n\n'Is he married or single?'\n\n'Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!'"
  ]
};

// Get content for a book - tries sample content first, then generates default
export const getBookContent = (title: string, author: string, apiContent?: string | null): string[] => {
  // If API has content, use it
  if (apiContent && apiContent.trim().length > 0) {
    const pages = apiContent.split(/\n\n+/).filter(page => page.trim().length > 0);
    if (pages.length === 1) {
      // Split long content into pages
      const text = pages[0];
      const wordsPerPage = 500;
      const words = text.split(/\s+/);
      const pageChunks: string[] = [];
      
      for (let i = 0; i < words.length; i += wordsPerPage) {
        pageChunks.push(words.slice(i, i + wordsPerPage).join(' '));
      }
      
      return pageChunks.length > 0 ? pageChunks : [text];
    }
    return pages;
  }
  
  // Check if we have sample content for this book
  const normalizedTitle = title.trim();
  if (sampleBookContents[normalizedTitle]) {
    return sampleBookContents[normalizedTitle];
  }
  
  // Generate default content
  return generateDefaultContent(title, author);
};

