Dwitter Application

Backend Programming language : NodeJs (12.18.3).
Database : ElasticSearch


Following are the details of Database:
1. Indexes
    a. users -> to store the user details
    b. dweets => store the dweets and its details
    c. likes -> store the likes data of respective dweets
    d. comments -> store the comments of respective dweets

following are the Indexes along with their respective fields

User : 
    id                              -> Unique id for all the records
    userName                        -> Capture the user's username
    name                            -> User's display name
    email                           -> user's email id
    password                        -> encrypted password
    passwordsalt                    -> use to encrypt the password set by user , used bcrypt module to encrypt the password  
    phone                           -> user's phone number
    birthdate                       -> user's birthdate
    followingDweeterIds             -> list of following dweeter
    verificationcode                -> auto generated code for email verification
    isverified                      -> flag set to TRUE when email is verified
    isDeleted                       -> if user account get deleted



dweets :
    id                              -> Unique id for all the records
    createdBy                       -> userid who had created/posted the dweet
    createdAt                       -> timestamp when dweet is created/posted
    updatedAt                       -> timestamp when dweet is updated/edited
    updatedBy                       -> userid who had updated/edited the dweet
    message                         -> dweet text
    normalizedMsg                   -> store the dweet text after removing the special characters and whitespaces to get on the unique dweets in database
    isDeleted                       -> if dweets get deleted

    

likes 

    id                              -> Unique id for all the records
    autherId                        -> userid who had created/posted the dweet
    likedBy                         -> userid who had liked the dweet
    dweetId                         -> dweetid on which like action done by any user
    datetime                        -> timestamp when the dweet is liked

comments
    id                              -> Unique id for all the records 
    autherId                        -> userid who had created/posted the dweet
    commentedBy                     -> userid who had commented on the dweet
    dweetId                         -> dweetid on which comment action done by any user
    comment                         -> comment text
    datetime                        -> timestamp when the comment added on dweet

/************************************APIs************************************************/

-------------------------------------------------------------------------------------
1.To register the User / Sign Up
-------------------------------------------------------------------------------------
Description : To register the new-user/Sign-up  the "/user/register" API will be used
URL: http://localhost:9000/

    a.  	API :  /user/register   
            method : POST
            Req :  {
                "userName":"pinkal209",
                "email":"pinkal209@gmail.com",
                "password":"xyz@123",
                "birthDate":"1996-07-01"
            }

            Response :{
                "code": 2000,
                "message": "",
                "data": {
                    "email": "pinkal209@gmail.com",
                    "name": "pinkal209"
                }
            }


*********************************************************************************

Once the user is successfully registered , from the frontend verification api "/user/sendVerificationMail" will be called which will sent the link to the user's registered email id

	b.	API : /user/sendVerificationMail
		method : POST
		Req : {
			"email": "pinkal209@gmail.com",
			"name":"pinkal_209"
		}

        Response :{
                "code": 2000,
                "message": "",
                "data": {
                    "email": "pinkal209@gmail.com",
                    "name": "pinkal209"
                }
        }
		
Once the user click on the verification link sent the mail, the "/verify" API will be triggered and change the user account isVerified flag to TRUE

	c.	API : /verify?id=0d1081ca-8a34-4338-ab1a-e610dd6c033f&code=4761020
		method : GET
		Req : id,code
        Response : {"code":2000,"message":"","data":"Email verified successfully"}
        

if the user is not verified user is not able to login into the system.

-------------------------------------------------------------------------------------
2.  User Login
-------------------------------------------------------------------------------------

Whenever user try to login into the application the "/auth/login" API will be triggered and do the authentication. If the credentials don't match it will not allow to access the application

	a.  API : /auth/login
		method : POST
		Req : {
			"email": "pinkal209@gmail.com",
			"password":"pinkal209"
		}

        Resp : {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJoYXZ5YTcwMUBnbWFpbC5jb20iLCJmdWxsTmFtZSI6ImJoYXZ5YSIsImlkIjoiNDEwMzU2MjYtYzhiMC00NTQwLTgzMTktOTU2Yjk1OWIwMzNkIiwiaWF0IjoxNjI4NzA1OTQzfQ.IYqoRPgEXujqLa5yJQtrJS3TxMbdstu5HZoxZhlRMZQ"
        }

-------------------------------------------------------------------------------------
3.	User Profile Update
-------------------------------------------------------------------------------------
This api is utilised when user wants to update username,birthdate or follow/unfollow the registered Dweeter

        API : /user/update
        method : POST
    	Req :  {
        	id:"123243242",
            	"name":"",
            	"birthDate":"",
            	"followUserId":"",
            	"unFollowUserId":""
        }

        Response :{
                "code": 2000,
                "message": "",
                "data": {
                    "email": "pinkal209@gmail.com",
                    "name": "pinkal209"
                }
        }

-------------------------------------------------------------------------------------
4. To search the other Dweeter
-------------------------------------------------------------------------------------
To find some other dweeter "/dweeter/search" API will be utilised
	
	API : /dweeter/search
	method : POST
	Req : {
        	"name":"mona"
    	}
	

	Response : {
        "code": 2000,
        "message": "",
        "data": [
            {
                "createdAt": "2021-08-11T17:03:15Z",
                "name": "mona",
                "id": "adca7b6d-9d00-438e-a2b8-4df0c17ec2df",
                "userName": "mona"
            },
            {
                "createdAt": "2021-08-11T17:07:33Z",
                "name": "mona sign",
                "id": "f5a77987-c9c1-4240-a3aa-3bffdb625264",
                "userName": "mona sign"
            }
        ]
    }
-------------------------------------------------------------------------------------
5. To post the Dweet
-------------------------------------------------------------------------------------
This api will be called when any dweeter want to post any dweet

	API : /dweet/post
	method : POST
	Req : {
        	"message":"Hello , Good morning"
    	}

	Response : {
        "code": 2000,
        "message": "",
        "data": true
    }

-------------------------------------------------------------------------------------
6. Like Dweet
-------------------------------------------------------------------------------------
this api is used to store the likes of dweet done by dweeter
	
	API : /dweet/like
    method : POST
	Req : {
        	"autherId":"2c23f25b-8cf1-48fd-a7f6-63c1e8cb4b8f",
        	"dweetId":"4876329e-3e86-4108-bc30-be36bff99ed2"
    	}

 	Response : {
        "code": 2000,
        "message": "",
        "data": true
    }

-------------------------------------------------------------------------------------
7. Comments on Dweet
-------------------------------------------------------------------------------------
this api is used to store the comments on dweet done by dweeter

	API : /dweet/comment
	method : POST
   	Req : {
        	"autherId":"2c23f25b-8cf1-48fd-a7f6-63c1e8cb4b8f",
        	"dweetId":"4876329e-3e86-4108-bc30-be36bff99ed2",
        	"comment":"nice"
    	}

	Response : {
        "code": 2000,
        "message": "",
        "data": true
    }
-------------------------------------------------------------------------------------
8. View Dweets
-------------------------------------------------------------------------------------
This api will fetch all the tweets of the dweeter which user is following

	API : /dweet/view
    method : GET

    Response : {
        "code": 2000,
        "message": "",
        "data": [
            {
                "createdAt": "2021-08-11T17:36:29Z",
                "createdBy": "41035626-c8b0-4540-8319-956b959b033d",
                "id": "5c55882f-081c-47e9-b23b-2eeb544baf13",
                "message": "Did you ever try this ?",
                "noOfLikes": 0,
                "comments": [
                    {
                        "id": "c9af5d77-dec5-4a89-962a-57d9a21f47fb",
                        "autherId": "41035626-c8b0-4540-8319-956b959b033d",
                        "commentedBy": "06a27674-5d29-48d6-bace-c078df2e0e72",
                        "dweetId": "5c55882f-081c-47e9-b23b-2eeb544baf13",
                        "comment": "why not ?",
                        "datetime": "2021-08-11T18:06:32Z"
                    }
                ],
                "liked": false
            },
            {
                "createdAt": "2021-08-11T17:35:34Z",
                "createdBy": "41035626-c8b0-4540-8319-956b959b033d",
                "id": "21faf285-6f31-4371-8bcc-9e28695ae9cd",
                "message": "Sachine is the greatest batsman",
                "noOfLikes": 1,
                "comments": [
                    {
                        "id": "1c77c430-714c-4290-9d74-67f526028720",
                        "autherId": "41035626-c8b0-4540-8319-956b959b033d",
                        "commentedBy": "06a27674-5d29-48d6-bace-c078df2e0e72",
                        "dweetId": "21faf285-6f31-4371-8bcc-9e28695ae9cd",
                        "comment": "I agree",
                        "datetime": "2021-08-11T18:04:57Z"
                    }
                ],
                "liked": true
            },
            {
                "createdAt": "2021-08-11T17:34:45Z",
                "createdBy": "41035626-c8b0-4540-8319-956b959b033d",
                "id": "ca0c3abc-08e6-4f44-80d5-b0306df9e88b",
                "message": "Wanna Try this ?? ",
                "noOfLikes": 1,
                "comments": [],
                "liked": false
            }
        ]
    }

-------------------------------------------------------------------------------------
9. To search the Dweets
-------------------------------------------------------------------------------------
this api will fetch all the specific dweets as per the user input

	API : /dweet/search
    method : POST
	Req :{
		"text":"ever this"
	}

    Response : {
        "code": 2000,
        "message": "",
        "data": [
            {
                "createdAt": "2021-08-11T18:20:57Z",
                "createdBy": "41035626-c8b0-4540-8319-956b959b033d",
                "id": "f1d54d86-ece2-4936-a175-ac77a7c1dff5",
                "message": "this is the best place I have ever visited",
                "noOfLikes": 0,
                "comments": [],
                "liked": false
            },
            {
                "createdAt": "2021-08-11T17:36:29Z",
                "createdBy": "41035626-c8b0-4540-8319-956b959b033d",
                "id": "5c55882f-081c-47e9-b23b-2eeb544baf13",
                "message": "Did you ever try this ?",
                "noOfLikes": 0,
                "comments": [
                    {
                        "id": "c9af5d77-dec5-4a89-962a-57d9a21f47fb",
                        "autherId": "41035626-c8b0-4540-8319-956b959b033d",
                        "commentedBy": "06a27674-5d29-48d6-bace-c078df2e0e72",
                        "dweetId": "5c55882f-081c-47e9-b23b-2eeb544baf13",
                        "comment": "why not ?",
                        "datetime": "2021-08-11T18:06:32Z"
                    }
                ],
                "liked": false
            }
        ]
    }

-------------------------------------------------------------------------------------
10. to change the user password
-------------------------------------------------------------------------------------
This api will be called when user want to change the password

	API : /user/changePassword
   	method : POST
	Req : {
        	"currentPwd":"",
        	"newPwd":"",
        	"confirmPwd":""
    	}

	Response : {
        "code": 2000,
        "message": "",
        "data": true
    }

-------------------------------------------------------------------------------------
11. to change the user password
-------------------------------------------------------------------------------------
This api will be used to see the user profile(Followers,Username, birthdate, dweets etc.)
	
	API : /user/profile
	method : GET
	Req : {
		id : ""
	}

	Response : {
        "code": 2000,
        "message": "",
        "data": {
            "userName": "pinkal209",
            "email": "pinkal209@gmail",
            "password": "Gn7nscyQs3..jtTCcI3N2Y02ApQU01.",
            "birthDate": "1996-07-01",
            "id": "06a27674-5d29-48d6-bace-c078df2e0e72",
            "name": "pinkal209",
            "passwordsalt": "$2b$10$0MT1TE36OlrBKAKYbORYqe",
            "createdAt": "2021-08-11T17:44:51Z",
            "isDeleted": false,
            "isVerified": true,
            "followingDweeterIds": [
                "41035626-c8b0-4540-8319-956b959b033d"
            ],
            "updatedBy": "06a27674-5d29-48d6-bace-c078df2e0e72",
            "updatedAt": "2021-08-11T17:52:25Z",
            "following": 1,
            "followers": 1,
            "dweets": [
                {
                    "createdAt": "2021-08-11T17:35:33Z",
                    "createdBy": "06a27674-5d29-48d6-bace-c078df2e0e72",
                    "id": "1537c819-cf3a-4a8c-8403-1468ae5cebde",
                    "message": "Travelling to ladakh :)",
                    "noOfLikes": 1,
                    "comments": [],
                    "liked": false
                },
                {
                    "createdAt": "2021-08-11T17:27:33Z",
                    "createdBy": "06a27674-5d29-48d6-bace-c078df2e0e72",
                    "id": "cce0ff13-6bf8-48ee-ba12-2b00ae2b0f01",
                    "message": "Hello , Good morning",
                    "noOfLikes": 0,
                    "comments": [],
                    "liked": false
                }
            ]
        }
    }