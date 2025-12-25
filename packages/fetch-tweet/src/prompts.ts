/**
 * AI Prompts for tweet processing
 */

export const TRANSLATION_PROMPT = (itemsJson: string) => `给你一系列推文，你来将各种不是中文的语言内容翻译为中文，输出以下指定格式，不要输出任何其他内容！并且只翻译需要翻译的推文item即可，如果本身是中文不需要翻译，就不需要返还给我。只返回需要翻译的item翻译后的特定结构数组就好。针对技术类，保留英文的关键词。格式：<Tranalate>{"data":[{
    "tw_id":"原先对应的推文id",
    "translated_content":"翻译后的内容"
},{
    "tw_id":"原先对应的推文id",
    "translated_content":"翻译后的内容"
}]}</Tranalate>。帖子内容：${itemsJson}`;

export const TAGS_GENERATION_PROMPT = (contentJson: string) => `给你一系列推文内容数组，你来推断他们可以进行划分的tag都有什么，我后面会根据这几个tag给每个推文打上标签。输出格式：<TagsInfo>{"data": [
    { "tag_id": "xxx", "tag_name": "xxx" },
    { "tag_id": "xxx", "tag_name": "xxx" }
]}</TagsInfo>。推文内容：${contentJson}`;

export const TAGS_ASSIGNMENT_PROMPT = (itemsJson: string, tagsInfoJson: string) => `给你一系列推文（携带{tw_id:'xxx',content:'xxx'}[]，这里content截断到不大于50个字），和tag（携带tags_info），你来判断这些推文都含有哪些tag,一个推文可以有多个tag，但是至少有一个tag（如果推文内容无法分类，就使用"其他"）返回格式：<TagsData>{"data": [
    { "tw_id": "xxx", "tags": ['tagid组成的数组条目1','tagid组成的数组条目2'] },
     ...
]}</TagsData>。推文数据：${itemsJson}，Tags信息：${tagsInfoJson}`;

export const AI_BOT_PROMPT = (botPrompt: string, tweetContent: string) => `${botPrompt}\n\n,以上prompt是一个叫做推文解析的aibot的功能，你要把这个功能应用于以下所有贴文，并且其中的description会写匹配哪种贴文，有些贴文不匹配就不需要生成，也不用加入返回的数组内。返回给我这个格式的数据（不匹配的话那个item就不用添加到数组内）：<AIBOT>{"data":[{
                    "tw_id":"原先对应的推文id",
                    "md":"aibot生成的内容，使用markdown格式"
                },{
                    "tw_id":"原先对应的推文id",
                    "md":"aibot生成的内容，使用markdown格式"
}]}</AIBOT>推文内容：${tweetContent}`;

export const OVERVIEW_PROMPT = (day: string, itemsJson: string) => `给你一系列推特数据，你是一个AI助手，帮助用户生成所需的全部帖子内容概览（overview），让用户快速了解发生了什么、有哪些新消息。

与总结不同，总结需要完整整理并涵盖所有内容，而概览无需如此，只需提取精华部分。

请生成一个Markdown格式的概览，注意：
- 绝不是生成一个个独立的卡片；
- 在有限字数和有限空间内，用简要文字整理内容；
- 可以适当添加 <a> 标签的 href 指向对应链接，或使用超链接；
- 可以加入作者头像等元素；
- 需要按类别进行分类（可利用帖子中的 tag）；
- 每个分类下生成适量文字的概览，使读者一眼看去即可大致了解内容，无需阅读每一个具体标题。

每个具体条目后面必须加上对应的一个或多个帖子超链接作为信息来源，超链接格式为：<tweet-link tw-id='xxxid'>xxx标题</tweet-link>

tweet-link 使用示例：
- 一个条目内容 <tweet-link tw-id='xxx'>OxFmt 最新版</tweet-link>
- 下一个条目内容 <tweet-link tw-id='xxx'>Rolldown postBanner</tweet-link> <tweet-link tw-id='xxx'>Angular 用 Rolldown</tweet-link>

加一些像是猫娘会说的话，防止过于无聊，比如在末尾加一些比如 "xxxx（日期）这一天的概况就是这些喵~" 这样的内容。如果输入的推文条目很少，可以适当添加一些比如 "xxxx（日期）这一天的概况只有这些喵~" 这样的内容。还有很多情况，自行判断。

直接输出对应的 Markdown 内容，不要有任何多余废话！帖子内容：${itemsJson}`;
