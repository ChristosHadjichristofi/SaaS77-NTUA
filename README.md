# SaaS Course
This course was focused on delivering the different applications/softwares as a service. We were asked to implement a QnA system with some specific functionalities. The project that we had to deliver had to be developed with two different architectures, so we decided to use **MVC Architecture** and **Microservices Architecture**.

## Constraints of Project
The only constraint of the project was to use NodeJS.

## MVC Architecture
To develop the project with the MVC Architecture we used:
* ExpressJS Framework
* PostgreSQL for the database
* Sequelize as an ORM
* EJS for the Views

## Microservices Architecture
To develop the project with the Microservices Architecture we started to make a plan on how to distribute the different functionalities of the project to different services. The distribution of functionalities to services is:
* Accounts Service: Signin, Signup
* Analytics Service: User stats (Questions Asked, Questions Answered, Contributions per Day)
* Answers Service: Get Question by ID, Answer Question by ID
* Ask Question Service: Post Question by ID
* Browse Questions Service: Get All Questions, Get All Questions asked by User with ID = id
* Event Bus Service: Notify subscribed services that a specific event was emitted
* Front End: The presentation layer of the project

### Event Bus
The event bus was developed from scratch by our team. The Event Bus has the **/events** endpoint (POST). When an Event occurs (i.e USER CREATED) the service that was used to create the user also emits the event on that specific endpoint of the Event Bus. Then the Event Bus notifies all subscribers.
The subscribers need to have a specific endpoint which is called **/events** (POST). So when the Event Bus receives a request on its **/events** endpoint, it makes sure to POST on every service that has the **/events** endpoint developed. So every service/subscriber has the event.

### How are Services able to know which Events they want
We make sure that every emitted event has a **TYPE**. The types that exist in our project are:
* USER CREATE
* QUESTION CREATE
* ANSWER CREATE

So when every service receives the event from the Event Bus, parses this TYPE and knows if has to do something with it or ignore it. With this **TYPE** attribute in each event object it is like we have three different channels that each subscriber listens to.

### What happens if a service is down
We make sure to store any occured Event in the Event Bus database. 
The reasons we made this decision are:
* When a service is down, it might lose some Events. So we make sure that every time a service/subscriber is (re)starting to ask for the lost events.
* If we want to develop a new service, we would like to **sync** it with all the past Events.

### How are Services asking for the **lost** Events
We make sure to store how many events each Service received and parsed, so as when the service/subscriber (re)starts to make a GET request on the **/events/:id** endpoint of the Event Bus.
The **/events/:id** endpoint simply returns all the Events of id greated than the requested param **id**
Also this task is performed asynchronously because the lost Events that the service eventually receives will be posted on its database (if needed) by using the async functions of the **Sequelize ORM**.  
