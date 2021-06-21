const asyncHandler = require('../middleware/async');
const RSSCombiner = require('rss-combiner');
const xml2js = require('xml2js');
const { maxHeaderSize } = require('http');
const News = require('../models/News');
const mainTags = require('../util/MainTags');
const cron = require('node-cron');

const mainTags = { Bluto: Science, Cycling: Lifecycle, Running: Lifecycle }

//channel Follow
const channelFollow = asyncHandler(async (req, res, next) => {

  const feedConfig = {
    title: 'News From theHindu, TOI, BBC, TheGuardian and Economic Times India',
    size: maxHeaderSize,
    feeds: [
      'https://www.thehindu.com/feeder/default.rss',
      'https://timesofindia.indiatimes.com/rssfeeds/1221656.cms',
      'http://feeds.bbci.co.uk/news/technology/rss.xml',
      'https://www.theguardian.com/uk/technology/rss',
      'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms',
    ],
    pubDate: new Date(),
  };

  const newsFollow = [];
  let main;
  let follow;
  let title;
  let feedLength;
  let newsInfo;

  await RSSCombiner(feedConfig).then((combinedFeed) => {
    const xml = combinedFeed.xml();
    const parser = xml2js.Parser();
    parser.parseString(xml, (err, result) => {
      main = result;
      follow = result.rss;
      title = follow.channel[0].title[0];
      newsInfo = result.rss.channel[0].item;
      feedLength = newsInfo.length;

      newsInfo.forEach((element) => {
        const object = {};
        object.headLine = element.title;
        object.description = element.description;
        object.link = element.link;
        object.category = element.category;
        let groups;
        let group = [];
        let items = element.category;
        if (items === undefined) {
          return (items = 'null');
        }

        groups = items.reduce((groups, item) => {
          group = groups[item] || [];
          group.push(item);
          groups[group] = mainTags[item];
          return groups;
        }, {});
        console.log(groups);
        object.tags = groups;

        let requiredTags = new Set();

        element.category.forEach((item) => {
          requiredTags.add(mainTags[item])
        })

        object.tags = requiredTags

        object.date = element.pubDate;
        newsFollow.push(object);
        // console.log(newsFollow);
      });
    });
  });

  // let news = user.news;
  let newsFeed = [];

  newsFollow.forEach((element) => {
    let object = {};

    object.headLine = element.headLine[0];
    object.description = element.description[0];
    object.link = element.link[0];
    object.category = element.category;
    object.date = element.date;
    object.tags = element.tags;

    newsFeed.push(object);
  });

  const connect = await News.create(newsFeed);

  const message = 'News Channels added Successfully....!';

  if (corns.start) {
    return null;
  } else {
    res.json({
      success: true,
      // message: '',
      // title: title,
      // count: feedLength,
      data: { message, title, feedLength, newsFeed },
      // data: result,
    });
  }
});

//channel unFollow
const channelUnFollow = asyncHandler(async (req, res, next) => {
  const news = null;
  const connect = await News.findByIdAndUpdate(req.body.id, { news });
  const message = 'News Channels Removed Successfully....!';
  res.json({
    success: true,
    data: message,
  });
});

//Paginate newsFeed
const paginateFeed = asyncHandler(async (req, res, next) => {
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);

  const results = await News.find()

    .skip((page - 1) * limit)
    .select()
    .limit(limit * 1);
  res.status(200).json({ success: true, data: results });
});

const corns = cron.schedule('00 05 * * *', function () {
  channelFollow();
  console.log('News Added ');
});

module.exports = {
  channelFollow,
  paginateFeed,
  channelUnFollow,
};
