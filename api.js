var http = require('http');
var express = require('express');   //taking module express from node_modules
var bodyParser = require("body-parser");
var app = express();  //var app as object
var path = require('path');
var mysql = require('mysql');
var Web3 = require('web3');
var solc = require('solc');
var util = require('util');
//var html= require('html');
var session = require('express-session');
app.use(session({secret: 'ssshhhhh'}));
var username;
var userid;
var bookid;
var chapterid;
var Autobio;

app.set('view engine', 'ejs');


//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',function(req,res){
	sess=req.session;
	sess.bookname;
	sess.genre;
  	res.sendfile("index.html");
});

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'autobioscrypt'
});




connection.connect();
app.set('port', 3000);

app.post('/login',function(req,res){

  username=req.body.username;
  var password=req.body.password;
  sess.username=username;
  


  
  //smart contract
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  web3.eth.defaultAccount = web3.eth.accounts[0];

  var AutobioContract = web3.eth.contract(JSON.parse('[ { "constant": false, "inputs": [ { "name": "_content", "type": "string" }, { "name": "_userid", "type": "string" } ], "name": "setInstructor", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getInstructor", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" } ]'));

  Autobio = AutobioContract.at('0x399014358a08270496ddb5e6189a2a788e93d1e3');

  


 //database 
  
  console.log("From html page\n username = "+username+"\n pass:"+password);
  console.log(sess.username);

  //connection.query('INSERT INTO messages (message) VALUES (?)',message);

  connection.query('SELECT * FROM user_detail where username=?',[username],
   function(err, results,fields){
    if(err){
    	console.log(err);

    	res.send({
	      "code":400,
	      "failed":"error ocurred"
	    })
    }
    else
    {
    	 if(results.length >0){
	      if(results[0].password == password){
	       /* res.send({
	          "code":200,
	          "success":"login sucessfull"
	            });*/
	            userid=results[0].id;
	            sess.userid=userid;
	            connection.query('SELECT COUNT(userid) AS id_count FROM book_details where userid=?',[userid],
		            function(error,results,fields){
	  				if (error) {
	  					
					    console.log("error ocurred",error);
					    res.send({
					      "code":400,
					      "failed":"error ocurred"
					    })
	  				}
	  				else{
	  					var count_id=results[0].id_count;
	  					if(count_id>0)
	  					{
	  						
	  						connection.query('SELECT bookname FROM book_details where userid=?',[userid],
		            			function(error,results,fields){
		            				console.log(results);
		            			});
	  							res.sendfile("book_details2.html");
	  					}
	  					else
	  					{
	  						
	  						res.sendfile("book_details.html");
	  					}

	  					
	  				}
  				});



	     


	            
	      }
	      else{
	        res.send({
	          "code":204,
	          "success":"Username or password does not match"
	            });
	      }
	  }
	  else{
	      res.send({
	        "code":204,
	        "success":"Username does not exits"
	          });
	    }
    }

    //res.render('messages', {messages : recordset});
    //res.send(results);

  });
});

app.post('/browse',function(req,res){
		connection.query('Select bookname,bookid from book_details ',
  			function(error, results, fields) {
				  if (error) {
				    console.log("error ocurred",error);
				    res.send({
				      "code":400,
				      "failed":"error ocurred"
				    })
 				 }
 				 else
 				 {
 				 			var name = JSON.stringify(results);
					  		res.render(__dirname+'/views/browse',{bname:name});

 				 }

 			});


});


app.post('/continue_browsing',function(req,res){
	 bookid=req.body.bookid;
	 connection.query('SELECT chaptername,chapterid FROM chapter_details where bookid=?',[bookid],
		   function(err, results,fields){
		    if(err){
		    	console.log(err);

		    	res.send({
			      "code":400,
			      "failed":"error ocurred"
			    })
		    }
		    else{

		    		

		    				console.log(results);
					   		var chapter_name = JSON.stringify(results);
					  		res.render(__dirname+'/views/continue_browsing_chp',{chpname:chapter_name});
		    			

		    		


		    }


		});


});

app.post('/continue_browsing_page',function(req,res){
	
		chapterid=req.body.chapterid;
		connection.query('SELECT page_no,pageid FROM page_details where chapterid=?',[chapterid],
		   function(err, results,fields){
		    if(err){
		    	console.log(err);

		    	res.send({
			      "code":400,
			      "failed":"error ocurred"
			    })
		    }
		    else{

		    		

		    				console.log(results);
					   		var page_name = JSON.stringify(results);
					  		res.render(__dirname+'/views/continue_browsing_page',{pagename:page_name});
		    			

		    		


		    }


		});





});

app.post('/page_show',function(req,res){
	
	pageid=req.body.pageid;
	connection.query('SELECT pagecontent,pageid FROM page_details where pageid=?',[pageid],
		   function(err, results,fields){
		    if(err){
		    	console.log(err);

		    	res.send({
			      "code":400,
			      "failed":"error ocurred"
			    })
		    }
		    else{

		    		

		    				console.log(results);
					   		var page_content = JSON.stringify(results);
					  		res.render(__dirname+'/views/content_display',{pagename:page_content});
		    			

		    		


		    }


		});






});


app.post('/link_to_book_details',function(req,res){
	res.sendfile("book_details.html");
});


app.post('/book_details',function(req,res){

	  	var bookname=req.body.bookname;
  		var genre=req.body.genre;
  		//database
  		sess.bookname=bookname;
  		sess.genre=genre;
	
  
  		console.log("bookname = "+bookname+"\n genre:"+genre);

  		connection.query('INSERT INTO book_details (userid,bookname,genre) VALUES (?,?,?)',[userid,bookname,genre],
  			function(error, results, fields) {
				  if (error) {
				    console.log("error ocurred",error);
				    res.send({
				      "code":400,
				      "failed":"error ocurred"
				    })
 				 }
				  else{
				    console.log('The solution is: ', results);
				    connection.query('SELECT * FROM book_details where bookname=?',[bookname],
   					function(err, results,fields){
						 if(err){
						    	console.log(err);

						    	res.send({
							      "code":400,
							      "failed":"error ocurred"
							    })
						    }
						    else
						    {
						    	 if(results.length >0){
							      bookid=results[0].bookid;
							      console.log("Bookid="+bookid);
							      //you need to convert your res to json
							      //return json to ui 
							      res.sendfile("chapter_details.html");
								  }
								  else{
								      res.send({
								        "code":204,
								        "success":"Bookname does not exits"
								          });
								    }
						    }
	

						  });

				  	}
 		 	});



});


app.post('/book_details2',function(req,res){


		connection.query('SELECT bookname,bookid FROM book_details where userid=?',[userid],
   					function(err, results,fields){
   					if(err){
						console.log(err);

						    	res.send({
							      "code":400,
							      "failed":"error ocurred"
							    })
   					}else{
   							console.log(results);
   							

					   		var name = JSON.stringify(results);

					  		//res.render(__dirname + "/main.html", {name:name});
					  		res.render(__dirname+'/views/main',{bname:name});
   					}


   		});


});




app.post('/continue_book_chapter_dets',function(req,res){

		
		bookid=req.body.bookid;
	  	console.log(bookid);
	  	 connection.query('SELECT chaptername,chapterid FROM chapter_details where bookid=?',[bookid],
		   function(err, results,fields){
		    if(err){
		    	console.log(err);

		    	res.send({
			      "code":400,
			      "failed":"error ocurred"
			    })
		    }
		    else{

		    		

		    				console.log(results);
					   		var chapter_name = JSON.stringify(results);
					  		res.render(__dirname+'/views/continue_chapter',{chpname:chapter_name});
		    			

		    		


		    }


		});

});



app.post('/continue_chapter',function(req,res){

		var chapterid=req.body.chapterid;




});

app.post('/link_to_chapterdetailshtml',function(req,res){
	res.sendfile("chapter_details.html");
});




app.post('/chapter_details',function(req,res){

	  	var chaptername=req.body.chaptername;
	  	var count=0;
  		
  		console.log(bookid);
  		//database 
  
  		//console.log("chaptername = "+chaptername);
  		connection.query('SELECT COUNT(bookid) AS total FROM chapter_details where bookid=?',[bookid],
  			function(error,results,fields){
  				if (error) {
  					console.log("hey");
				    console.log("error ocurred",error);
				    res.send({
				      "code":400,
				      "failed":"error ocurred"
				    })


  				}
  				else{

  					
  					count=results[0].total+1;
  					//chapter_no2=chapter_no;
  					//console.log(count);
  					connection.query('INSERT INTO chapter_details (bookid,chaptername,chapter_no) VALUES (?,?,?)',[bookid,chaptername,count],
  					function(error, results, fields) {
				 		 if (error) {
						    console.log("error ocurred",error);
						    res.send({
						      "code":400,
						      "failed":"error ocurred"
						    })
 						 }
				  		else{
						    console.log('The solution is: ', results);
						    connection.query('SELECT * FROM chapter_details where chaptername=?',[chaptername],
		   					function(err, results,fields){
								 if(err){
								    	console.log(err);

								    	res.send({
									      "code":400,
									      "failed":"error ocurred"
									    })
								    }
								    else
								    {
								    	 if(results.length >0){
										      chapterid=results[0].chapterid;
										      console.log("Chapterid="+chapterid);
										      res.sendfile("page_details.html");
										  }
										  else{
										      res.send({
										        "code":204,
										        "success":"Chaptername does not exits"
										          });
										    }
								    }
	

						  		});

				  			}
 		 				});
  					
  				}


  			});
		console.log(count);

});

app.post('/page_details',function(req,res){

	  	var content=req.body.content;
  		var count=0;
  		//database 
  
  		console.log("content = "+content);

  		connection.query('SELECT COUNT(chapterid) AS total FROM page_details where chapterid=?',[chapterid],
  			function(error,results,fields){
  				if (error) {
				    console.log("error ocurred",error);
				    res.send({
				      "code":400,
				      "failed":"error ocurred"
				    })


  				}
  				else{

  					
  					count=results[0].total+1;
  					//chapter_no2=chapter_no;
  					//console.log(count);
  					connection.query('INSERT INTO page_details (chapterid,pagecontent,page_no) VALUES (?,?,?)',[chapterid,content,count],
  					function(error, results, fields) {
				 		 if (error) {
						    console.log("error ocurred",error);
						    res.send({
						      "code":400,
						      "failed":"error ocurred"
						    })
 						 }
				  		else{
						    console.log('The solution is: ', results);
						     	Autobio.setInstructor(userid,content);

												Autobio.getInstructor(function(error, result){
													if(!error)
													{
														     console.log("from smart contract="+result);
													}
													else
														     console.error(error);
												});

						   /* connection.query('SELECT * FROM page_details where pagecontent=?',[content],
		   					function(err, results,fields){
								 if(err){
								    	console.log(err);

								    	res.send({
									      "code":400,
									      "failed":"error ocurred"
									    })
								    }
								    else
								    {
								    	 if(results.length >0){
										      	Autobio.setInstructor(userid,content);

												Autobio.getInstructor(function(error, result){
													if(!error)
													{
														     console.log("from smart contract="+result);
													}
													else
														     console.error(error);
												});
											}
										  else{
										      res.send({
										        "code":204,
										        "success":"Chaptername does not exits"
										          });
										    }
								    }
	

						  		});*/

				  			}
 		 				});
  					
  				}


  			});


	});

app.get('/logout',function(req,res){
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});