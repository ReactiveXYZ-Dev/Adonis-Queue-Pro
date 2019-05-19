# Adonis Queue Pro
Adonis queue pro is a worker-based queue library for [AdonisJS](https://github.com/adonisjs/adonis-framework), it is backed by [Kue](https://github.com/Automattic/kue) and [Kue-Scheduler](https://github.com/lykmapipo/kue-scheduler). 

**There has been a few breaking API changes since v1 (which supports adonis v3.2), please read the doc carefully!**

## Features
  - Ace commands for generating jobs and start workers
  - Use your existing adonis modules in your queue processor
  - (Close-to) Full kue/kue-scheduler API supported including future/repeat job scheduling
  - Multi-worker mode supported
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
- add `Queue: 'Adonis/Addons/Queue'` to your aliases object
- add the following commands to your commands array

`'Adonis/Commands/Queue:Init'`

`'Adonis/Commands/Queue:Job'`
	 
`'Adonis/Commands/Queue:Work'`

## Consumer/Producer model
Instead of defining Job as a single entity, this library separates the responsibility of job into consumer and producer, here are the definitions:

**Producer:** Define the static properties of the job, in kue's context,  **supported** properties include **priority, attempts, backOff, delay, ttl and unique**. Documentations of each property can be found in Kue and Kue-scheduler's Github.

**Consumer:** Define the runtime properties of the job, in kue's context,  **supported** properties include **concurrency** and the process handler.

Example of a basic producer/consumer pair can be found by generating a sample job using the ``./ace queue:job`` command.

## CLI API

### Initialize (Must be done first!)
```sh
$ ./ace queue:init
```
This will create the queue configuration file and placed in the **config** directory, which is very similar to [kue-scheduler](https://github.com/lykmapipo/kue-scheduler)'s config file.

This will also create the queue server adaptor in the **start** and root directory, which will be the entry point for the queue worker process.

### Manage jobs

#### Create a job

You can create a new job by running:

```sh
$ ./ace queue:job SendEmail --jobId='send-email'
```
The option `jobId` is optional, if not provided, the kue type for the job will be a kebab-case of the argument. i.e. SendEmail -> send-email.

This command will create job producers and consumers in designated directories, which are configurable in **config/queue.js** with **consumerPath** and **producerPath**; this defaults to **app/Jobs/{Consumers | Producers}**.

The job consumers and producers will both run in Adonis framework's context, thus you can easily use any supported libraries within the job file. 

#### Remove a job

Similarly, you can remove an existing job by running:

```sh
$ ./ace queue:job SendEmail --remove
```

### Run worker
```sh
$ ./ace queue:work 4
```
The argument defines the number of workers to run simultaneously. Default to 1 if not provided. 

**Notice**: This command only supports a simple ``fork`` based process manager which is easy for local testing. It does not handle worker failure nor graceful restart. For production usage, you can use tools such as [Supervisor](https://github.com/Supervisor/supervisor) or [PM2](https://github.com/Unitech/pm2), and the command will be ``node start/queue.js`` in your app’s root directory.

## Job API

The producer job file supports Kue job properties which are defined as an ES6 ``get`` property in the class, see example by running `./ace queue:job`.

Refer to supported job properties above in the **Consumer/Producer Model** section.

The consumer job file supports Kue job's **concurrecy** defined as an ES6 `static get` property in the class, see example by running `./ace queue:job`.

The processing function is defined as an async function `async handle()` or `handle()` depending on whether your task is asynchronous. Within the task class, you can access constructor-injected payload with `this.data`.

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
onProgress(Float progress)
// data returned from handle() method
onComplete(Object data)
onRemove(String jobType)
// error caught in the handle() method
onFailed(Error error)
onFailedAttempts(Error error)
```
This producer job class itself is an Event Listener, thus you can export the data received from the job event to the outside world. 

A useful scenario is to remove job after it has been initialized: 

```js
// within job producer class
onInit(job) {
    this.emit('init');
}
// outside of the consumer
// for queue.remove() see Queue API below
job.on('init', () => Queue.remove(job).then(...));
```

## Queue API

### Access the queue
```js
const Queue = use('Queue');
```
### Push job onto the queue
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

Remove a single job, the argument must be the **job instance** you created:

```js
// asynchronous removal...
Queue.remove(job).then(response => {}, error => {});
```

Clear all jobs:

```js
// also returns a promise
Queue.clear().then(response => {}, error => {});
```

Note: currently <i>clear()</i> will not trigger the <i>remove</i> event on the job.

### Run tests

Please clone [the Adonis test app repo](https://github.com/ReactiveXYZ-Dev/adonis-queue-pro-test), install the dependencies, and run ``adonis test`` to run the spec tests. (Make sure redis is installed and configured properly as required by Kue).

You can also contribute to the test repo by submitting issues and PRs.

## Development

Contributions are welcome! This is a community project so please send a pull request whenever you feel like to!

### Todos
 - Expose API for graceful failure/restart
 - Improve efficiency
 - Squash bugs

License
----

MIT

