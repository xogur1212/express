const express = require('express')    //로드

const app = express() //express 호출 app-> 객체가 담겨져있음
const fs = require('fs')
const template =require('./lib/template.js')
const path=require('path')
const sanitizeHtml= require('sanitize-html');
const qs= require('querystring'); //모듈중에 querystring
const port = 3000
const bodyParser=require('body-parser')

const compression =require('compression')
app.use(express.static('public'));  //정적인 파일 public 폴더에서 찾겠다.
app.use(bodyParser.urlencoded({ extended: false })); //미들웨어
//route,routing pathname===? 일떄 실행되는걸 라우팅이라고함
app.use(compression()); //미들웨어 리턴 용량큰것을 압축해서 post 에러안나게
app.get('*',(req,res,next)=>{
  fs.readdir('./data',function(error,filelist){
    req.list=filelist;
    next();
  })
})


app.get('/', (req, res) => {  
 
    var list=template.list(req.list);  //리스트 만들기
    var title='Welcome';
    
    var description='hello,node js';
  
    var html =template.HTML(title,list,`<h2>${title}</h2>
      <p>${description}</p>`,
      `<a href="/create">create</a> `);

    res.send(html);    // response.writeHead(200);  //200성공 404 실패
                            //response.end(html); 이렇게 두줄작성한것과 같음
   
  
})

app.get('/page/:pageId',(req,res)=>{    //urlpathparameter방식
        // res.send(req.params);   //localhost/page/HTML 햇을때 params안에 pageId:HTML이 들어감

    var filteredId= path.parse(req.params.pageId).base;//..차단함 //pageID가 여기에 들어감
    console.log(filteredId);
    var list=template.list(req.list );  //리스트 만들기

  fs.readFile(`data/${filteredId}`,'utf8',function(err,description){    //id에 파일읽어와서 내용이 desc~
  var title=req.params.pageId;
  var sanitizedTitle=sanitizeHtml(title); //이걸쓰면 저장은되지만 html출력할떄 script부분을 날려버린다.
  var sanitizedDescription =sanitizeHtml(description,{
    allowedTags:['h1']      //옵션을줘서허용태그만적용할수있따.
  });//이걸쓰면 저장은되지만 html출력할떄 script부분을 날려버린다.
  var html =template.HTML(sanitizedTitle,list,`<h2>${sanitizedTitle}</h2>
  <p>${sanitizedDescription}</p>`,
  ` <a href="/create">create</a> 
    <a href="/update/${sanitizedTitle}">update</a>
    <form action="/delete_process" method="post" onsubmit="dlsdasd">
      <input type="hidden" name="id" value="${sanitizedTitle}">
      <input type="submit" value="delete">
    </form>`);//업데이트할떄 id같이 넘겨서 수정
  res.send(html);
  
})
})
app.listen(port, () => {    //listen 이 될떄 웹서버가 동작함 성공햇을때 아래코드 실행
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/create',(req,res) =>{
 
          
    
      var list=template.list(req.list);  //리스트 만들기
      var title='Web - create';
      var html =template.HTML(title,list,`
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `,'');
      res.send(html);
    
  
})

app.post('/create_process',(req,res)=>{

  /*
  var body='';
  req.on('data',function(data){       //post데이터가많으면 data는 100중에 수신할떄마다 서버는콜백함수를 호출하도록 약속함 데이터라는 인자값을통해 주기로 약속함
    body=body+data;
    if(body.length>1e6){
      req.connection.destroy();   //연결량이 존나많으면 끊어
    }
  });//request
  req.on('end',function(){      //들어오는게없으면 end를 호출하도록 약속햇음
      var post=qs.parse(body);
      var title=post.title;
      var description=post.description;
      fs.writeFile(`data/${title}`,description, 'utf8',
      function(err){
        res.redirect(302, {Location: `/?id=${title}`});//302 redirect 한다는 번호 //createprocess가 끝날떄 파일위치보여주기
        
      });
      
  });//request
  */
  
    //미들웨어떄문에 이렇게써도됨
  var post = req.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function(err){
    res.writeHead(302, {Location: `/?id=${title}`});
    res.end();
        
      });
});

app.get('/update/:pageId',(req,res)=>{
  
    var list=template.list(req.list);  //리스트 만들기
    var filteredId= path.parse(req.params.pageId).base;//..차단함
  fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
  var title=req.params.pageId;
  var html =template.HTML(title,list,
  `
  <form action="/update_process" method="post">
    <input type="hidden" name="id" value="${title}">
    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
    <p>
      <textarea name="description" placeholder="description">${description}</textarea>
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `,
  `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);//업데이트할떄 id같이 넘겨서 수정
  res.send(html);
 
})
})

app.post('/update_process',(req,res)=>{
 
  var post = req.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error){
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      res.redirect(`/?id=${title}`);
    
  });
  })
});

app.post('/delete_process',(req,res) => {
  var body='';
  req.on('data',function(data){       //post데이터가많으면 data는 100중에 수신할떄마다 서버는콜백함수를 호출하도록 약속함 데이터라는 인자값을통해 주기로 약속함
    body=body+data;
    if(body.length>1e6){
      req.connection.destroy();   //연결량이 존나많으면 끊어
    }
  });//request
  req.on('end',function(){      //들어오는게없으면 end를 호출하도록 약속햇음
      var post=qs.parse(body);
      var id= post.id;
      var filteredId=path.parse(id).base;   //..이렇게접근해서 삭제해버리는거막음
      fs.unlink(`data/${filteredId}`,function(error){
        
        res.redirect('/');//res.writeHead(302, {Location: `/`});//302 redirect 한다는 번호 //createprocess가 끝날떄 파일위치보여주기
                           // res.end();랑같음
                        
      });
  
  });//request


})

/*
var http = require('http');
var fs = require('fs');
var url =require('url');  //모듈이용할떄
var qs= require('querystring'); //모듈중에 querystring
var template =require('./lib/template.js')
var path=require('path')
var sanitizeHtml= require('sanitize-html');




var app = http.createServer(function(request,response){   //본격시작
    var _url = request.url;
    var queryData=url.parse(_url,true).query; //객체로 가져온다. 클라이언트로 받아올때 파싱해서받아온다
    var pathname=url.parse(_url,true).pathname;
    
      
    if(pathname ==='/'){
      if(queryData.id===undefined){ //없는값 을 undefined로 약속  // /로접속햇을떄 메인페이지
          
      
      }//queryData.id==if문 종료
      else{   // /?id=css 이런곳 베이스가 /인데서 queryid가잇을떄ㅐ

      }//else  undefined가 아니라면종료
      
    }//pathname===/ 종료
    else if(pathname==='/create'){    //path /create
     
      }
    }//else if pathname 종료
    else if(pathname==='/create_process'){
 
     

    }//else if create process종료
    else if(pathname==='/update'){
      fs.readdir('./data',function(error,filelist){
        var list=template.list(filelist);  //리스트 만들기
        var filteredId= path.parse(queryData.id).base;//..차단함
      fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
      var title=queryData.id;
      var html =template.HTML(title,list,
      `
      <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);//업데이트할떄 id같이 넘겨서 수정
      response.writeHead(200);  //200성공 404 실패
      response.end(html);
      })
    })

    }//else if update
    else if(pathname==='/update_process'){


    }//elseif update_process
    else if(pathname==='/delete_process'){
     

    }//elseif delete_process
    else{
      response.writeHead(404);
      response.end('Not found');
    }//else 종료

  
    
 
});//createserver 종료
app.listen(3000);


/*

동기와 비동기
*/