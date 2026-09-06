export const NEWS_SOURCES = [
  { id: 'bbc-business', name: 'BBC Business', category: 'business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { id: 'bbc-world', name: 'BBC World', category: 'business', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'bbc-entertainment', name: 'BBC Entertainment', category: 'entertainment', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml' },
  { id: 'techcrunch', name: 'TechCrunch', category: 'trends', url: 'https://techcrunch.com/feed/' },
  { id: 'coindesk', name: 'CoinDesk', category: 'markets', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { id: 'guardian-business', name: 'The Guardian Business', category: 'business', url: 'https://www.theguardian.com/business/rss' },
  { id: 'guardian-culture', name: 'The Guardian Culture', category: 'entertainment', url: 'https://www.theguardian.com/culture/rss' },
  { id: 'guardian-technology', name: 'The Guardian Technology', category: 'trends', url: 'https://www.theguardian.com/uk/technology/rss' },
  { id: 'guardian-africa', name: 'The Guardian Africa', category: 'africa', url: 'https://www.theguardian.com/world/africa/rss' }
];

export const CATEGORY_LABELS = {
  business: 'Business',
  markets: 'Markets',
  trends: 'Trends',
  entertainment: 'Entertainment',
  africa: 'Africa'
};
