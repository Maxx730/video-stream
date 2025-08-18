sub init()
  m.player = m.top.findNode("player")
  m.top.setFocus(true)

  ' Build a ContentNode explicitly (avoids type mismatch)
  content = CreateObject("roSGNode", "ContentNode")
  content.url = "http://video.clam-tube.com/hls/Random%20Movies.m3u8"
  content.SetField("streamFormat", "hls")
  content.title = "Test HLS"

  m.player.content = content         ' <-- THIS is where your error was
  m.player.observeField("state", "onPlayerState")
  m.player.observeField("errorCode", "onPlayerError")
  m.player.control = "play"
end sub

sub onPlayerState()
  ?m.player.content.url
  ? "VIDEO state:", m.player.state   ' buffering | playing | paused | finished | error
end sub

sub onPlayerError()
  ? "VIDEO errorCode:", m.player.errorCode
  ' If available on your firmware, also try:
  ' ? "VIDEO errorMsg:", m.player.errorMsg
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    if press then
      ?"Key Pressed:" + key
      if key = "left":
        ?"Menu Open:"
      end if
    end if
    return false
end function
