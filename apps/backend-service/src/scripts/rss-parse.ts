import Parser from 'rss-parser';


const rssParse = async () => {
    const parser = new Parser();
    const cnbc1 = await parser.parseURL('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114');
    const cnbc2 = await parser.parseURL('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=17646093');
    console.log(cnbc1.items[0])
    console.log(cnbc2.items[0])
}

rssParse()