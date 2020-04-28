brochain
========

my philosofy is simple: we have all the technology to be able to deliver
justice as superposition of all justices of primal cultural broth. we are
ready to perform revolution from inside with tools we have already created.

we just need to have some understanding to where should we go. and this is
the compass i am going to do.

моя философия проста: существуют все технологии, способные осуществить
справедливость как суперпозицию справедливостей всего первичного бульона
культур. мы готовы совершить ревлюцию изнутри созданными нами инструментами.

нам только надо немножко осознать, в какую сторону мы для этого должны пойти.
здесь -- компас, который укажет путь.

usage
-----

### local

#### requirements:

 * node12

#### development:

`npm run dev` will start development server on all available interfaces:

 * `https://0.0.0.0:8082`

### GCP

#### requirements:

 * node12
 * gcloud

#### deploy

deploys into flex app engine container

pre-requisites:

 * `gcloud` toolkit installed

`npm run deploy`

#### operate

pre-requisites:

 * supported browser
   
   should work on:
    * Firefox@Linux
    * Chrome@MacOS,
    * Chrome@Android
    * Safari@IOS

 * a bag of hemp to keep away all frustration

after deployment it'll tell u URL to go

### improve!

hell yeah... but how? dig in the shit... erh.... code :) fork, dumb, create!!!

features
--------

MVP is what's planned to initial official release.
MVP-next is futurology.

### MVP

list of features for the first release

1. volatile meetings + self-organization (all-with-all)
  1. peer who joins get to know everybody else connected
  2. single-link join to meeting
2. controls:
  1. mute a person
  2. mute myself
  3. hide myself
  4. disconnect
3. known issues:
  1. disconnect handling
    1. firefox does not generate event


### MVP-next

1. chat-feature!
2. cross-platform
  1. android webview app
  2. ios webview app
3. poop-feature!
  1. send poop, display poop
  2. poop reactions:
    1. auto-mute a person who floods you with poop
    2. ???
4. video processing
  1. face detection use square tiles focused on face
  2. detect emotions and color tiles accordingly
     (e.g. green border -- smile, red border -- angry)
  3. attach things (mustache?:)) to face landmarks
    1. share attached things with others


**development**
---------------

this section is btw the main one at current state of being. previous were just introduction.

### generic algorithm

 1. run
    `npm run dev`

 2. after successful compilation it'll say that peer and beacon are updated there will be url:
    `http://localhost:8082/`

 3. open browser, look at what's there is, try it, define what you don't like, improve it!

 4. code is in `src/peer` directory, less likely you would want to change `src/beacon.js`
    upon any file update corresponding module will be rebuilt

    * all files which relate to **peer** must start with `src/peer`

    * all files related to **beacon** must start with `src/beacon`

### improvements planned

in order of priority:

 1. increase stability

 2. increase accessibility

   1. simplicity

   2. portability

 3. add features, e.g.:

   1. mute

   2. chat