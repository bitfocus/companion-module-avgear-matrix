## Companion Module avgear Matrix

This module allows you to control your avgear matrix. Currently, this module only supports the TMX88PRO AV HDMI Matrix.

## Module Setup

Enter the IP address for the device in the module connection settings. If you have set up the device to run on a non-standard port (ie. not port 4001), that port can also be set in the connection settings. All that's left is to set your polling interval. By default the module will poll the device once every 10 seconds - a value of 0 will disable polling, but as connections to the device are not kept open, that will mean that the module will assume the device is online until the next action is performed. If you are using companion to also monitor device state, it is recommened that if you are concerned about companion or network load to just have a higher polling interval so that state will at least be reasonably accurate.

## Actions

The following actions are possible:

#### Poll GUI IP

This action will allow you to get the latest GUI IP address. This is included in the standard polling, so this is only needed if you have disabled polling or you need the information right now.

#### Poll System Status

This action will allow you to get the entire the entire system status. This is included in the standard polling, so this is only needed if you have disabled polling or you need the information right now.

#### Power Off Unit

This action will power the unit off.

#### Power On Unit

This action will power the unit on.

#### Recall Preset

This action will recall the defined preset. These presets are generally set in the Web GUI.

#### Refresh Labels from Matrix

This action will refresh the labels stored in the variables based on what has been set in the Web GUI. This may need to be run manually if you have updated these in the Web GUI as it's not part of the core polling response.

#### Route Input to All Outputs

This action will route the defined input to all outputs.

#### Route Input to Output

This action will route the defined input to the defined output.

#### Save Preset

This action will store the current switching status to the defined preset

#### Toggle Unit Power

This action will toggle the unit power based on the current known status.

#### Turn Output Off

This action will turn the defined output off.

#### Turn Output On

This action will turn the defined output on.

## Variables

The following variables are available:

#### $(Matrix:gui_ip)

The current Web GUI IP address.

#### $(Matrix:input_X_label)

The current label of the requested input.

#### $(Matrix:lcd_readout)

The current label displayed on the LCD screen of the unit.

#### $(Matrix:output_X_input)

The current input of the requested output.

#### $(Matrix:output_X_input_label)

The current input label of the requested output.

#### $(Matrix:output_X_is_on)

The current output status of the requested output.

#### $(Matrix:output_X_label)

The current label of the requested output.

#### $(Matrix:title_bar)

The current unit title bar as defined in the Web GUI.

#### $(Matrix:unit_is_on)

A boolean noting the current known unit power state.

## Feedbacks

The following feedbacks are available:

#### Output Power On

This feedback shows whether the defined output is powered on.

#### Route Active

This feedback shows whether the defined route (Input->Output) is active.

#### Unit Power On

This feedback shows whether the unit is currently powered on.

## Versions

### 1.0.0

Initial release

### 2.0.0

Added support for API 2.0; Moved `inputChoices` and `outputChoices` to be reusable; Added `preset_recall` and `preset_save` presets; Corrected help documentation for config options.
