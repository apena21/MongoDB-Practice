// Grab the articles from database


$.getJSON("/articles", function(data) {
    //console.log(data);
    for (var i = 0; i < data.length; i++) {
        var Entry = createEntry(data[i]);
        
      console.log(Entry);
        // The title of the article
        $("#scrapedArticles").append(Entry);
        
}}
) 

function createEntry(ArticleSchema){
    //create table row
    var row = $("<tr>")
    var add = $("<td>")
    var addHeadline = $("<td>")
    var addSummary = $("<td>")
    var addLink = $("<td>")
    addHeadline.text(ArticleSchema.headline)
    addSummary.text(ArticleSchema.summary)
    addLink.text(ArticleSchema.link)
    //comment.text(ArticleSchema.comment)
    row.append(addHeadline, addSummary, addLink, "<td></td>");
    
    // converting jQuery object into html string using .prop('outerHTML')
    return row.prop('outerHTML');
  }

  //for comments:  .populate - use on server side, call on article schema to populate the notes 
  // use reference from notes to articles (see examples).  Do this in get/articles and/or get/articles:id.s