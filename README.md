hterm
=====
Author: Robert Ginda <rginda@google.com>

      .--~~~~~~~~~~~~~------.
     /--===============------\
     | |```````````````|     |
     | |               |     |
     | |      >_<      |     |
     | |               |     | 
     | |_______________|     | 
     |                   ::::| 
     '======================='  ,--.       ,--.                           
     //-"-"-"-"-"-"-"-"-"-"-\\  |  ,---. ,-'  '-. ,---. ,--.--.,--,--,--. 
    //_"_"_"_"_"_"_"_"_"_"_"_\\ |  .-.  |'-.  .-'| .-. :|  .--'|        | 
    [-------------------------] |  | |  |  |  |  \   --.|  |   |  |  |  | 
    \_________________________/ `--' `--'  `--'   `----'`--'   `--`--`--' 

 
What is "hterm"?
----------------

"HTML Terminal", or hterm, is an xterm-compatible terminal emulator written
entirely in JavaScript.

It is intended to be fast enough and correct enough to compete with native
terminals such as xterm, gnome-terminal, konsole and Terminal.app.

hterm is only a terminal emulator.  It does not provide SSH access (or any
other text-based command) on its own.


How does hterm differ from existing web terminals?
--------------------------------------------------

hterm stands out from many existing web terminals in that it was built from
the start to match the performance and correctness of "native" terminals such
as xterm and Terminal.app.

It can handle large bursts of text quickly, support very large scrollback
buffers, and it closely matches xterm's behavior.  The keyboard even mostly
works.  (ha!  See the note about how to get Ctrl-W below.)

What should I do if I notice a bug?
-----------------------------------

First, please continue reading this FAQ to make sure your issue isn't
mentioned.  Then check the bug list at <http://goo.gl/hpqWk>.

If you don't see the issue there, you can search the archives of the
chromium-hterm mailing list here: <http://goo.gl/RYHiK>.

If all else fails then join the chromium-hterm mailing list and post
about what you've found.

If your bug involves some mis-interpreted escape sequence and you want
to file a really useful bug report, then add in a recording of the
session.  For bonus points, track down the troublesome sequence and
include the offset into the log file.  For more information about how to
do this, see the "Debugging escape sequences" section in the hack.txt file
in this directory.


Is there a mailing list to discuss hterm?
-----------------------------------------

Yes, the public chromium-hterm mailing list is here: <http://goo.gl/RYHiK>.

How do I change the audible bell sound?
-----------------------------------------

Open the JavaScript console and type...

    term_.prefs_.set('audible-bell-sound', 'http://example.com/bell.ogg')

Change the example url to point to the sound file you want to use.
Unfortunately, local file: urls are not supported at this time.  If you
want to get fancy you could construct a data: url, but the details of
that are beyond the scope of this FAQ.

How do I disable the audible bell?
----------------------------------

Open the JavaScript console and type...

    term_.prefs_.set('audible-bell-sound', '')

How do I change the color scheme?
----------------------------------

You can change the foreground, background or cursor color preferences from
the JavaScript console like this...

    term_.prefs_.set('background-color', 'wheat')
    term_.prefs_.set('foreground-color', '#533300')
    term_.prefs_.set('cursor-color', 'rgba(100, 100, 10, 0.5)')

You can use any valid CSS color value for any of these colors.  You need
to use a semi-transparent color (the fourth parameter in the rgba value)
for the cursor if you want to be able to see the character behind it.

How do I change the font face?
----------------------------------

Open the JavaScript console and type...

    term_.prefs_.set('font-family', 'Lucida Console')

Replace 'Lucida Console' with your favorite monospace font.

Keep in mind that some fonts, especially on Mac OS X systems, have bold
characters that are larger than the non-bold version.  hterm will print a
warning to the JS console if it detects that you've selected a font like
this.  It will also disable "real" bold characters, using only bright
colors to indicate bold.


How do I change the default font size?
--------------------------------------

Open the JavaScript console and type...

    term_.prefs_.set('font-size', 15)

Replace 15 with your desired font size in pixels.  15 is the default, so
you'll have to pick a different number to have any effect at all.

Can I quickly make temporarily changes to the font size?
--------------------------------------------------------

Yes.  The Ctrl-Plus, Ctrl-Minus and Ctrl-Zero keys can increase, decrease,
or reset the current font size.  This zoomed size is not remembered the
next time you start hterm.  See the previous question if you want something
that will stick.

It's useful to know that hterm has to handle font zooming on its own.
Without interference from the browser's built-in zoom function.

The browser zoom introduces rounding errors in pixel measurements that
make it difficult (maybe impossible) for hterm to accurately position the
cursor on the screen.  (It could do a little better than it does but
probably not enough to be worth the effort.)

To mitigate this, hterm will display a warning message when your browser
zoom is not 100%.  In this mode the Ctrl-Plus, Ctrl-Minus and Ctrl-Zero
keys are passed directly to the browser.  Just press Ctrl-Zero to reset your
zoom and dismiss the warning.

hterm should start handling Ctrl-Plus, Ctrl-Minus and Ctrl-Zero on its
own once your zoom setting is fixed.


Why do I get a warning about my browser zoom?
---------------------------------------------

Because hterm requires you to set your browser to 100%, or 1:1 zoom.
Try Ctrl-Zero or the Wrench->Zoom menu to reset your browser zoom.  The
warning should go away after you correct the zoom level.

See the previous question for more information.


How do I disable anti-aliasing?
-------------------------------

Open the JavaScript console and type...

    term_.prefs_.set('font-smoothing', 'none')

This directly modifies the '-webkit-font-smoothing' CSS property for the
terminal.  As such, 'none', 'antialiased', and 'subpixel-antialiased' are
all valid values.

The default setting is 'antialiased'.

How do I make the cursor blink?
-------------------------------

Open the JavaScript console and type...

    term_.prefs_.set('cursor-blink', true)

Notice that true is NOT in quotes.  This is especially important if you try
to turn blinking back off, with...

    term_.prefs_.set('cursor-blink', false)

or you could just revert to the default value of false with...

    term_.prefs_.reset('cursor-blink')

How do I change the TERM environment variable?
----------------------------------------------

Open the JavaScript console and type...

    term_.prefs_.set('environment', {TERM: 'hterm'})

Notice that only 'hterm' is quoted, not the entire value.  You can replace
'hterm' with whichever value you prefer.

The default TERM value is 'xterm-256color'.  If you prefer to simulate a
16 color xterm, try setting TERM to 'xterm'.

You will have to reconnect for this setting to take effect.

How do I enter accented characters?
-----------------------------------

That depends on your platform and which accented characters you want to
enter.

In xterm, you could use Alt-plus-a-letter-or-number to select from the
upper 128 characters.  The palette of 128 characters was "hardcoded" and
not dependent on your keyboard locale.  You can set hterm to do the same
thing by opening the JavaScript console and typing...

    term_.prefs_.set('alt-sends-what', '8-bit')

However, if you are on Mac OS X and you prefer that Alt sends a character
based on your keyboard locale, try this instead...

    term_.prefs_.set('alt-sends-what', 'browser-key')

Note that composed characters (those that require multiple keystrokes) are
not currently supported by this mode.

If you are running Chrome OS on a Chromebook you can select your keyboard
locale from the system settings and just use the Right-Alt (the small one,
on the right) to enter accented characters.  No need to change the
'alt-sends-what' preference at all.

The default value for 'alt-sends-what' is 'escape'.  This makes Alt work
mostly like a traditional Meta key.

If you really, really want Alt to be an alias for the Meta key in every
sense, use...

    term_.prefs_.set('alt-is-meta', true)


How do I make backspace send ^H?
--------------------------------

By default, hterm sends a delete (DEL, '\x7f') character for the
backspace key.  Sounds crazy, but it tends to be the right thing for
most people.  If you'd prefer it send the backspace (BS, '\x08', aka ^H)
character, then open the JavaScript console and type...

    term_.prefs_.set('backspace-sends-backspace', true)


How do I send Ctrl-W, Ctrl-N or Ctrl-T to the terminal?
-------------------------------------------------------

Chrome blocks tab contents from getting access to these (and a few other)
keys.  You can open Secure Shell in a dedicated window to get around
this limitation.  Just right-click on the Secure Shell icon and enable
"Open as Window".

After that, any time you launch Secure Shell it will open in a new window
and respond properly to these accelerator keys.

Note that the "Open as Window" option is not available on the Mac.  However,
Mac keyboards typically have distinct Control, Alt, and Command keys, so it's
less of an issue on that platform.  Secure Shell cannot treat Command as
Control or Meta, but there are some third party keyboard utilities that may
provide a solution.

How do I copy text from the terminal?
-------------------------------------

By default, Secure Shell automatically copies your active selection to the
clipboard.

You can disable this by setting the 'copy-on-select' preference to false.
If you disable it you'll need to use one of the following key sequences
to copy to the clipboard...

* Under Mac OS X the normal Command-C sequence works.

* On other platforms Ctrl-C will perform a Copy only when text is selected.
  When there is no current selection Ctrl-C will send a "^C" to the host.

Note that after copying text to the clipboard the active selection will be
cleared.  If you happen to have text selected but want to send "^C",
just hit Ctrl-C twice.

* Under all platforms you can also use the "Copy" command from the Wrench
  menu, when running Secure Shell in a browser tab.


How do I paste text to the terminal?
------------------------------------

By default, Shift-Insert pastes the clipboard on all platforms.  If you'd
prefer to be able to send Shift-Insert to the host, set the
'shift-insert-paste' preference to false.

Also...

* Under Mac OS X the normal Command-V sequence can be used to paste from
  the clipboard.
* On other platforms use Ctrl-Shift-V to paste from the clipboard.
* Under X11, you can use middle-mouse-click to paste from the X clipboard.
* Under all platforms you can also use the "Paste" command from the Wrench
  menu.


Does hterm support the "OSC 52", aka "clipboard operations" sequence?
---------------------------------------------------------------------

Clipboard writing is allowed by default, but you can disable it if you're
paranoid.  Set the 'enable-clipboard-write' preference to false to disable
the control sequence.

Clipboard read is not implemented.  Reading is a security hole you probably
didn't want anyway.

Clipboard writes are triggered by an escape sequence from the host.  Here's
an example...

   $ echo -e "\x1b]52;c;Y29weXBhc3RhIQ==\x07"

The sequence "\x1b]52;" identifies this as a clipboard operation.  The "c;"
option selects the system clipboard.  "Y29weXBhc3RhIQ==" is the base64 encoded
value to place on the clipboard, in this case it's the string "copypasta!".
Finally, "\x07" terminates the sequence.

If you execute this command when 'enable-clipboard-write' on you should see
the "Selection Copied" message appear in the terminal, and your system
clipboard should contain the text, "copypasta!".

Note that the specification for OSC 52 mentions destinations other than
the "c;" system clipboard.  Hterm treats them all as the system clipboard.

----

