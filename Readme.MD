# Karmabot

Karmabot is a slack bot that helps you keep track of how awesome things are. 

## Easy Installation

Click the button!

<a href="https://slack.com/oauth/authorize?client_id=496346185462.494344275745&scope=bot"><img alt="Add Karmabot to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"></a>

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

Feel free to suggest more features as GitHub issues.

## Legal Stuff

Karmabot is a glorified key-value store. Please don't store personal information in Karmabot. I'm not sure how you would, 
but please don't use Karmabot to break laws or do immoral things.

## Infrastructure

Karmabot deploys to AWS Lambda and is accessed through API Gateway. It uses a MongoDB database hosted in Mongo Cloud Atlas,
for the simple reason that they gave me a 200$ voucher at a conference.

I might add some CloudFormation templates at some point to help anyone wanting to copy my infrastructure setup.
