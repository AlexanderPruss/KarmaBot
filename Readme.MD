# Karmabot

Karmabot is a slack bot that helps you keep track of how awesome things are. 

# Still a work in progress! 

Karma increasing and decreasing works, but leaderboards are not yet implemented.

The biggest features coming are a distribution as a Slack app (so you don't have to run everything yourself) 
and Terraform/Docker/K8s files in the `infrastructure` folder (so it's easy to run yourself if you want). 

## Usage

Karmabot's design currently plans for two different interactions. You can increment/decrement the 
karma of various things, and you can ask Karmabot for a leaderboard to see what is loved the most.

To get Karmabot's attention, either send it a direct message or post a message with `@Karmabot` 
in a channel that Karmabot has been invited to. Karmabot will then parse your message as follows:

- Karmabot will increment or decrement the karma of strings that are proceeded with `++` or `--`. You can 
increment or decrement up to five points at a time.
  - Ex: `coffee++` -> Coffee now has one more point.
  - Ex: `monday----` -> Monday now has three less points.
- Messages containing the phrase `!leaderboard` will have Karmabot reply with the current top 5 karma holders.

Feel free to suggest more features.

## Installing Karmabot to Slack

I'll distribute Karmabot over Slack later (read - once a first version is working). Until then, if you want to use Karmabot, 
get the app running and add a bot user with the `app_mention` and `message.im` event 
subscriptions. See [Slack's bot guide](https://api.slack.com/bot-users) for more details.

## Configuration

Karmabot uses the [`config` npm package](https://www.npmjs.com/package/config). The `config/default.json` folder contains a list of configuration 
variables that you'll need to set to get Karmabot running. You can add your own values in a `config/dev.json` 
or `config/production.json` file and start Karmabot with the appropriate `npm` task, or just set the 
right value of `NODE_ENV` in your terminal/vm/container.

## Stack

* Node
* Koa 
* (WIP) Mongo - will add additional DB connectors for hipper databases later.

## Infrastructure

WIP - the `infastructure` folder contains some sample k8s deployment yamls you can
use to setup a cluster, as well as a terraform configuration for creating the required 
resources in AWS.
