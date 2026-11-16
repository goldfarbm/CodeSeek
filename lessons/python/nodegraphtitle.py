import hou
import nodegraphprefs as prefs

def networkEditorTitleLeft(editor):
    try:
        title = ''
        pwd = editor.pwd()
        playerparm = pwd.parm('isplayer')
        if playerparm is not None and playerparm.evalAsInt() != 0:
            title += 'Network in Playback Mode\n'
        if prefs.showPerfStats(editor):
            profile = hou.perfMon.activeProfile()
            if profile is not None:
                profiletitle = profile.title()
                if not profiletitle:
                    profiletitle = 'Profile ' + str(profile.id())
                title += profiletitle + ': ' + prefs.perfStatName(editor)


    except:
        title = ''

    # if we have an apex graph, check if debugger is active
    # and let user know
    try:
        sid = pwd.sessionId()
        apex_node = hou.apexNodeBySessionId(sid)
        dbugger = apex_node.debugger()
        if dbugger.isEnabled():
            active_str = "Debugger Active"
            title += f'\n{active_str}' if title else active_str
    except:
        pass
    
    return title

def networkEditorTitleRight(editor):
    version = hou.applicationVersionString()
    build = hou.applicationVersion()[2]
    try:
        title = ''
        pwd = editor.pwd()
        title += f"Houdini {version} (Build {str(build)}) - {pwd.childTypeCategory().label()}"
        # title += pwd.childTypeCategory().label()

    except:
        title = ''

    return title

