<p align="center">
    <a href="#">
      <img src="./image.png" alt=""  width="260" height="510" />
    </a>
</p>

<h3 align="center">
  React Native Multichannel Widget
</h3>
<p align="center">
  The most complete chat UI Multichannel for React Native
</p>

## Requirements

- React Native Version >= 0.59

## Installation

- Using npm `npm i @qiscus-community/react-native-multichannel-widget`
- Using yarn `yarn add @qiscus-community/react-native-multichannel-widget`

## Configuration Widget

### 1. Add `MultichannelWidgetProvider` in App.js

We use Hooks to synchronize data. To make it work we have to explicitly insert a mount point in your app like this:

```
// in your entry file like `App.js`
import {MultichannelWidgetProvider} from '@qiscus-community/react-native-multichannel-widget';

// in your render function
return (
  <MultichannelWidgetProvider>  // <- use MultichannelWidgetProvider
    <App />
  </MultichannelWidgetProvider>
);
```

[Reference : ExampleApp](ExampleApp/App/index.js#lines-70:74)

### 2. Initialization Widget

Initiate widget for first time

```
import {Qiscus} from '@qiscus-community/react-native-multichannel-widget';
const SplashCreen = () => {
useEffect(()=>{
    //optional params
    let options = {
      baseURLMultichannel: // custom base url Multichannel
      baseURLSdk: // custom base url SDK
      mqttURLSdk: // custom mqtt url SDK
      brokerLbURLSdk: // custom broker LB url SDK
      uploadURLSdk: // custom uploader url SDK
    }
    Qiscus.setup(AppId,options);
},[])
....
};

```

[Reference : ExampleApp](ExampleApp/App/index.js#lines-26)

> **_AppId Qiscus_** _used to initiate chat applications in qiscus, further related to AppId :_ [_https://documentation.qiscus.com/latest/multichannel-customer-service/settings-and-configuration#app-information_](https://documentation.qiscus.com/latest/multichannel-customer-service/settings-and-configuration#app-information)

### 3. Initialization Chat

Initiate room chat

```
import Widget from '@qiscus-community/react-native-multichannel-widget';

const widget = Widget();
widget.initiateChat(options)
  .then(result => {

  })
  .catch(e => {

  })
```

[Reference: ExampleApp](ExampleApp/App/screens/HomeScreen.js#lines-61)

## Input options (object prefered)

| fields         | type                        | required | description                                                             |
| -------------- | --------------------------- | -------- | ----------------------------------------------------------------------- |
| userId         | string                      | true     | unique identifier of a user                                             |
| name           | string                      | true     | display name of a user                                                  |
| deviceId       | string                      | false    | device token from fcm, used for push notification needs                 |
| extras         | json_string/ json_object    | false    | eg: {"data_source": "us"}                                               |
| additionalInfo | json_string/ json_object    | false    | it will fill the user properties bar on the right side of customer room |
| messageExtras  | json\_\_string/ json_object | false    | will fill the information on message extras                             |
| channelId      | integer                     | false    | optional, init chat on target channel_id                                |

Example

```
const USER_ID = "user01@mail.com"
const NAME = "user01"
const FCM_TOKEN = "12345678"
const USER_EXTRAS = {
    user_id: "user01",
    is_priority: true
}
const ADDISIONAL_INFO = {
"full name" : "Linda",
"email" : "linda@mail.com"
}
let options = {
    userId : USER_ID,
    name : NAME,
    deviceId: FCM_TOKEN,
    extras: USER_EXTRAS,
    additionalInfo: ADDISIONAL_INFO
}
widget.initiateChat(options)
  .then(result => {

  })
  .catch(e => {

  })
```

### 4. Use Header Component

Using component header

<kbd><img src="image1.png" /></kbd>

```
<Header
  height={56}
  style={{
    backgroundColor : 'orange'
  }}
  textColor = 'white'
/>
```

**Props**

- `title` _(String)_ - Custom title
- `subtitle` _(String)_ - Custom subtitle
- `avatar` _(Object)_ - Extra props to be passed Component to custom avatar
- `height` _(Integer)_ - Height of the Header, default is `56`
- `headerRight` _(Object)_ - Extra props to be passed Component to the Right Header
- `headerLeft` _(Object)_ - Extra props to be passed Component to the Left Header
- `style` _(Object)_ - Extra props to be passed custom style header
- `textColor` _(String)_ - Custom text color header

[Reference : ExampleApp](ExampleApp/App/screens/ChatScreen.js#lines-37)

### 5. Use Chat Room Component

Using chat room component

<kbd><img src="image2.png" width="260" height="510" /></kbd>

```
<MultichannelWidget
  onSuccessGetRoom={room => {
  }}
  onDownload={onDownload}
  onPressSendAttachment={onPressSendAttachment}
/>
```

**Props**

- `onSuccessGetRoom` _(Function(`room`))_ - Callback when success get room
- `onPressSendAttachment` _(Function)_ - Callback when button Send Attachment is tapped
- `onPressVideo` _(Function)_ - Callback when button media player is tapped
- `onDownload` _(Function)_ - Callback when a download message attachment is tapped
- `renderSendAttachment` _(Object)_ - Extra props to be custom Component button Send Attachment
- `renderSendMessage` _(Object)_ - Extra props to be custom Component button Send Message
- `placeholder` _(String)_ - Extra props to be custom placeholder, default `Type a message...`
- `renderTickSent` _(Object)_ - Extra props to be custom Component Tick Sent
- `renderTickDelivered` _(Object)_ - Extra props to be custom Component Tick Delivered
- `renderTickRead` _(Object)_ - Extra props to be custom Component Tick Read
- `renderTickPending` _(Object)_ - Extra props to be custom Component Tick Pending
- `filterMessage` _(Function(message))_ - Extra props to filter list message
- `avatar` _(Object)_ - Extra props to be passed Component to custom avatar
- `onTyping` _(Function)_ - Callback when a user typing

[Reference : ExampleApp](ExampleApp/App/screens/ChatScreen.js#lines-183)

## Get Unread Message Count

To get unread message count, you can use getUnreadCount method like below.

```
widget.getUnreadCount(callback)
```

## End Session User

To request end session or end chat, you can use endSession method like below.

```
widget.endSession()
```

## Remove Notification

At the logout action from the app, you need to implement removeNotification method like below to remove FCM_TOKEN from Qiscus Server, that means Qiscus Server not sending push notifications again to the device.

```
widget.removeNotification('FCM_TOKEN')
```

> _FCM_TOKEN is the same value when first initiation in step:_ [3. Initialization Chat](#3-initialization-chat) link

## Change Language

To change the language you can use changeLanguage method with input en for English and id for Indonesia.

```
widget.changeLanguage("en")
```

## Get Qiscus SDK Service

To get Qiscus functionalities, you can import Qiscus like below.

```
import {Qiscus} from '@qiscus-community/react-native-multichannel-widget';
```

```
// another example to get room object from qiscus
import {Qiscus} from '@qiscus-community/react-native-multichannel-widget';

let room = Qiscus.qiscus.selected
```

for more methods related qiscus sdk service, you can read on this link : https://github.com/Qiscus-Integration/react-native-multichannel-widget/blob/master/lib/services/qiscus/index.js

[Reference : ExampleApp](ExampleApp/App/screens/ChatScreen.js#lines-163)

## Example App

[ExampleApp](master/ExampleApp) folder contains an example app to demonstrate how to use this package.

**How to run the example app**

- Clone or download this repo
- Open ExampleApp directory
- create new file with name `.env` file like .[env_sample](ExampleApp/.env_sample) add **APP_ID** with your Multichannel AppId
- Open your terminal or cmd and execute `npm install` command
- To run the Example App you need to execute `react-native run-android` command and wait for the process to complete

## Push Notification

To implement push notification in react native widget you need to add FCM Key in notifications setting, below is how to do it, you need to read in “**Android's Customer Widget Push Notification”** section
https://documentation.qiscus.com/multichannel-customer-service/settings-and-configuration#notifications

## References

- Multichannel Mobile in app widget from scratch : https://documentation.qiscus.com/multichannel-customer-service/channel-integration#mobile-in-app-widget
- Mobile App push notification : https://documentation.qiscus.com/multichannel-customer-service/channel-integration#mobile-app-push-notification
