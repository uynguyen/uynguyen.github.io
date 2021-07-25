---
title: 'Dark Hat - v1.0 has been released 🎉'
date: 2021-07-25 19:35:30
tags:
---

![](/Post-Resources/Darkhat/darkhat.png "")

After years of working in BLE technology, I found that despite there are many applications helping to test BLE devices but none of them performs their roles well. That’s why I decided to implement a BLE application on my own - [Dark Hat](https://apps.apple.com/az/app/dark-hat/id1576175854?ign-mpt=uo%3D2). The core objective of this application is to share a better tool with you - an engineer working in BLE field.
<!-- more -->
## Main Features
`Discover nearby devices` with `multiple filters supported` to only show devices which mater to the user.
- Filter by RSSI.
- Filter by device name.
- Filter by service UUID: Only retrieve and scan devices having your service UUID.
<center>
<img src="/Post-Resources/Darkhat/scanning.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/filters.jpg" alt="" style="width:200px;"/>
</center>

Support many options in a setting that allows users to customize the app to meet their requirements.
- `State management`: Auto reconnect when the connection is lost.
- `Preservation and Restoration`: The user now can opt-in to test "Preservation and Restoration". For more detail about this technique, please refer to [Best practice: How to deal with Bluetooth Low Energy in background](/2018/07/23/Best-practice-How-to-deal-with-Bluetooth-Low-Energy-in-background/)
- Steps in the connection flow are now `controlled by the user`: connection timeout, set notification state and more.

<center>
<img src="/Post-Resources/Darkhat/setting.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/state_management.jpg" alt="" style="width:200px;"/>
</center>

The main screen shows `all info and services` that really matter to you. 
`The inline log` view helps you have a better observation of what's happening on your device.
The app also offers an option that allows the user to set his own name for characteristics for better visualization, on | off notification, copy UUID to clipboard, and more.
<center>
<img src="/Post-Resources/Darkhat/inline_log.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/channel_option.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/channel_options.jpg" alt="" style="width:200px;"/>
</center>

The app supports `a smart editor` that automatically suggests all recent commands - a small improvement but it helps to reduce your time on testing.
The characteristic detail screen now offers an option allowing `show all responses from multiple characteristics` which helps you to catch the whole flow while testing.

<center>
<img src="/Post-Resources/Darkhat/channel.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/sugesstion.jpg" alt="" style="width:200px;"/>
</center>

<br />

`Easy for sharing`: Share your result just in 1 click.

<center>
<img src="/Post-Resources/Darkhat/response.jpg" alt="" style="width:200px;"/>
<img src="/Post-Resources/Darkhat/sharing.jpg" alt="" style="width:200px;"/>
</center>

## Architecture

At the heart of this application is an SDK called `BLEFramework` - implemented by me - that wraps all logic working with Apple’s BLE framework and provides simple interfaces for high-level layers - the application. By doing this way, we can separate the complex logic from the UI application, making it easy for development and maintenance.
Additionally, I plan to move all UI views to a cross-platform technology (maybe React Native) to support Android in a unique, single view layer. All I just need to do is create another SDK supports for Android platform.

![](/Post-Resources/Darkhat/arch.png "")

## Next steps
I have a road map to add more amazing features to the app, to name a few: realtime streaming data, speed measurement, multiple connections, control by script, iBeacons.
Can't wait to deliver all these cool features to users.
If you have any idea or feedback, feel free to kick an email to uynguyen.itus@gmail.com or dark.hat.ble@gmail.com, I would love to hear from you.

