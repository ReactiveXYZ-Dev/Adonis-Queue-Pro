# Adonis Queue Pro (Still in progress... DO NOT INSTALL)
Adonis queue pro is a queue-worker library for [AdonisJS](https://github.com/adonisjs/adonis-framework), it is backed by [Kue](https://github.com/Automattic/kue) and [Kue-Scheduler](https://github.com/lykmapipo/kue-scheduler). 


**There have been a few breaking usage changes, please read the doc carefully!**


## Features
  - Ace commands for generating jobs and start workers
  - (Close-to) Full kue/kue-scheduler API supported including future/repeat job scheduling
  - Multi-worker mode supported with full suite of AdonisJS API
  - Produce/Consumer model for structuring your job
  - Simple and Elegant API for scheduling and processing your jobs

## Notices
This version only support **Adonis V4.0+**. For V3.2 support, please check the **v1** branch.

## Installation
	
    npm install --save adonis-queue-pro

## Configuration
In your **star/app.js**, edit the following:

- add `'adonis-queue-pro/providers/QueueProvider'` to your providers array.
- add `'adonis-queue-pro/providers/CommandProvider'` to your aceProviders array.
- add `Queue: 'Adonis/Addons/Queue'` to your aliases array
- add below commands to your commands array

`'Adonis/Commands/Queue:Init'`

`'Adonis/Commands/Queue:Job'`
	 
`'Adonis/Commands/Queue:Work'`

## Consumer/Producer model
Instead of defining Job as a single entity, this library separates the responsibility of job into consumer and producer, here are the definitions:

**Producer:** Defines the static properties of the job, in kue's context,  **supported** properties include **priority, attempts, backOff, delay, ttl and unique**. Documentations of each property can be found in Kue and Kue-scheduler's Github.

**Consumer:** Defines the runtime actions of the job, in kue's context,  **supported** actions include **concurrency** and the process handler.

Example of a basic producer/consumer pair can be found by generating a sample job using the ``./ace queue:generate`` command.

## CLI API

### Initialize (Must be done first!)
```sh
$ ./ace queue:init
```
This will create the queue configuration file and placed in the **config** directory, which is very similar to [kue-scheduler](https://github.com/lykmapipo/kue-scheduler)'s config file.

This will also create the queue server adaptor in the **start** and root directory, which will be the entry point for the queue worker process.

### Create job
```sh
$ ./ace queue:job SendEmail --jobId='send-email'
```
The option `jobId` is optional, if not provided, the kue type for the job will be a kebab-case of the argument. i.e. SendEmail -> send-email.

This command will create job producers and consumers in directory configurable in **config/queue.js** with **consumerPath** and **producerPath**. Default to **app/Jobs/{Consumers | Producers}**.

The job consumers and producers will both run in Adonis framework context, thus you can easily use any supported libraries within the job file. 

### Run worker
```sh
$ ./ace queue:work 4
```
The argument defines the number of workers to run simultaneously. Default to 1 if not provided. 

**Notice**: This command only support a simple ``fork`` based process manager easy for local testing. It does not handle worker failure nor graceful restart. For production usage, you can use tools such as [Supervisor](https://github.com/Supervisor/supervisor) or [PM2](https://github.com/Unitech/pm2), and the command will be ``node queue_server.js`` in your app directory.

## Job API

The producer job file supports Kue job properties which are defined as an ES6 ``get`` property in the class, see example by running `./ace queue:job`.

Refer to supported job properties above in the **Consumer/Producer Model** section.

The consumer job file supports Kue job's **concurrecy** defined as an ES6 `static get` property in the class, see example by running `./ace queue:job`.

The processing function is defined as a generator function `* handle()`  which can access constructor-injected payload using `this.data`.

The producer job class also supports job events, listed below:
```js
// with in producer class
// job has been created and scheduled
// useful for retrieving redis id for the job
onInit(Kue/Job job)
// See kue documentation for below
onEnqueue(String jobType)
onStart(String jobType)
onPromotion(String jobType)
onRemove(String jobType)
onProgress(Float progress)
// data returned from handle() method
onComplete(Object data)
// error caught in the handle() method
onFailed(Error error)
onFailedAttempts(Error error)
```
This producer job class itself is an Event Listener, thus you can export the data received from the job event to the outside world. 

A useful scenario is to remove job by id, which is retrievable from the `onInit` method: 

```js
// within job producer class
onInit(job) {
    this.emit('init', job.id);
}
// outside of the consumer
// for queue.remove() see Queue API below
job.on('init', id => Queue.remove(id));
```

## Queue API

### Access the queue
```js
const Queue = use('Queue');
```
### Push job on to queue
```js
// optionally inject data into the job class using constructor
// and access it in the consumer handler using this.data
const ExampleJob = use('App/Jobs/Producer/ExampleJob');
Queue.dispatch(new ExampleJob({'data': 'whatever'}));
```
`Queue.dispatch()` has a second optional `String` argument default to 'now', which reflects the Kue-Scheduler API:
```js
// schedule a job immediately
Queue.dispatch(new ExampleJob, 'now');
// schedule a repeated job every 2 seconds
// basically embeding the 'every' method into the string itself
Queue.dispatch(new ExampleJob, 'every 2 seconds');
// schedule a single job in the future
Queue.dispatch(new ExampleJob, '2 seconds from now');
```
### Remove jobs
Remove a single job by id
```js
// asynchronous removal...
Queue.remove(id).then(response => {}, error => {});
```

Clear all jobs
```js
// also returns a promise
Queue.clear().then(response => {}, error => {});
```

## Development

Contributions are welcomed ! This is an early start project so please send a pull request when you squashed a bug!

### Todos
 - Write tests
 - Complete Kue API integration
 - Squash bugs

License
----

MIT

