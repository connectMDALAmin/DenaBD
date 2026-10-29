export interface IslamicQuote {
  id: number;
  arabic?: string;
  bangla: string;
  english: string;
  source: string;
  category: 'debt' | 'trade' | 'honesty' | 'dua';
}

export const islamicQuotes: IslamicQuote[] = [
  {
    id: 1,
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ',
    bangla: '“হে ঈমানদারগণ! তোমরা যখন একে অপরের সাথে নির্দিষ্ট মেয়াদের জন্য ঋণের লেনদেন করো, তখন তা লিখে রাখো।”',
    english: '“O you who have believed, when you contract a debt for a specified term, write it down.”',
    source: 'সূরা আল-বাক্বারাহ (২:২৮২)',
    category: 'debt',
  },
  {
    id: 2,
    arabic: 'التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ',
    bangla: '“সত্যবাদী ও বিশ্বস্ত ব্যবসায়ী কিয়ামতের দিন নবী, সত্যনিষ্ঠ ও শহীদদের সাথে থাকবেন।”',
    english: '“The truthful, trustworthy merchant is with the prophets, the truthful, and the martyrs.”',
    source: 'তিরমিজি (হাদিস ১২০৯)',
    category: 'trade',
  },
  {
    id: 3,
    arabic: 'مَطْلُ الْغَنِيِّ ظُلْمٌ',
    bangla: '“ঋণ পরিশোধে সামর্থ্যবান ব্যক্তির টালবাহানা বা বিলম্ব করা একটি মারাত্মক জুলুম।”',
    english: '“Procrastination in paying debts by someone who can afford it is an act of injustice.”',
    source: 'সহিহ বুখারি (হাদিস ২২৮৭), সহিহ মুসলিম (হাদিস ১৫৬৪)',
    category: 'debt',
  },
  {
    id: 4,
    arabic: 'وَإِن كَانَ ذُو عُسْرَةٍ فَنَظِرَةٌ إِلَىٰ مَيْسَرَةٍ ۚ وَأَن تَصَدَّقُوا خَيْرٌ لَّكُمْ',
    bangla: '“আর যদি ঋণগ্রহীতা অসচ্ছল হয়, তবে তাকে সচ্ছলতা আসা পর্যন্ত সময় দেওয়া উচিত। আর ঋণ মাফ করে দেওয়া তোমাদের জন্য আরও উত্তম, যদি তোমরা জানতে!”',
    english: '“And if someone is in hardship, then let there be postponement until a time of ease. And if you give from your right as charity, it is better for you, if you only knew.”',
    source: 'সূরা আল-বাক্বারাহ (২:২৮০)',
    category: 'debt',
  },
  {
    id: 5,
    arabic: 'مَنْ أَنْظَرَ مُعْسِرًا أَوْ وَضَعَ عَنْهُ أَظَلَّهُ اللَّهُ فِي ظِلِّهِ يَوْمَ لَا ظِلَّ إِلَّا ظِلُّهُ',
    bangla: '“যে ব্যক্তি কোনো অভাবগ্রস্ত ঋণগ্রহীতাকে সময় দিল অথবা তার ঋণ মাফ করে দিল, আল্লাহ তাআলা কিয়ামতের দিন তাকে তাঁর আরশের ছায়ায় স্থান দেবেন।”',
    english: '“Whoever grants respite to someone in difficulty or waives a debt, Allah will shade him in His shade on the Day when there is no shade but His.”',
    source: 'সহিহ মুসলিম (হাদিস ৩০০৬)',
    category: 'debt',
  },
  {
    id: 6,
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
    bangla: '“হে আল্লাহ! আমি আপনার নিকট দুশ্চিন্তা ও দুঃখ-বেদনা থেকে, অক্ষমতা ও অলসতা থেকে, ভীরুতা ও কৃপণতা থেকে এবং ঋণের বোঝা ও মানুষের অত্যাচার থেকে আশ্রয় প্রার্থনা করছি।”',
    english: '“O Allah, I seek refuge in You from worry and grief, incapacity and laziness, cowardice and stinginess, the burden of debt, and being overpowered by men.”',
    source: 'সহিহ বুখারি (হাদিস ২৮৯৩) — ঋণমুক্তির দোয়া',
    category: 'dua',
  },
  {
    id: 7,
    arabic: 'رَحِمَ اللَّهُ رَجُلاً سَمْحًا إِذَا بَاعَ، وَإِذَا اشْتَرَى، وَإِذَا اقْتَضَى',
    bangla: '“আল্লাহ সেই ব্যক্তির প্রতি বিশেষ অনুগ্রহ করেন, যে ব্যক্তি পণ্য বিক্রয়কালে, ক্রয়কালে এবং নিজের প্রাপ্য তাগাদা দেওয়ার সময় নম্রতা ও উদারতা প্রদর্শন করে।”',
    english: '“May Allah show mercy to a man who is gentle when he sells, when he buys, and when he seeks to recover his debt.”',
    source: 'সহিহ বুখারি (হাদিস ২০৭৬)',
    category: 'trade',
  },
  {
    id: 8,
    arabic: 'مَنْ أَخَذَ أَمْوَالَ النَّاسِ يُرِيدُ أَدَاءَهَا أَدَّى اللَّهُ عَنْهُ، وَمَنْ أَخَذَ يُرِيدُ إِتْلاَفَهَا أَتْلَفَهُ اللَّهُ',
    bangla: '“যে ব্যক্তি পরিশোধের সৎ নিয়তে মানুষের ধন-সম্পদ ঋণ হিসেবে গ্রহণ করে, আল্লাহ তার পক্ষ থেকে তা পরিশোধের ব্যবস্থা করে দেন। আর যে তা আত্মসাৎ করার উদ্দেশ্যে নেয়, আল্লাহ তাকে ধ্বংস করে দেন।”',
    english: '“Whoever takes the wealth of people with the intention of repaying it, Allah will repay it on his behalf; and whoever takes it with the intention of wasting it, Allah will ruin him.”',
    source: 'সহিহ বুখারি (হাদিস ২৩৮৭)',
    category: 'debt',
  },
];
