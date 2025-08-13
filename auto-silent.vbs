Dim shell, fso, scriptDir, batFile
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = "C:\Users\tanzi\Downloads\college-attendance-dev\college-attendance-dev\"
batFile = scriptDir & "auto-service.bat"
shell.Run """" & batFile & """", 0, False
Set shell = Nothing
Set fso = Nothing
