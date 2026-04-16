# # import psutil

# # def get_processes():
# #     process_list = []

# #     for p in psutil.process_iter(['pid', 'name', 'memory_info']):
# #         try:
# #             name = p.info['name']

# #             # Skip empty names
# #             if not name:
# #                 continue
# #             if "exe" not in name.lower():
# #              continue
# #             # Get CPU usage (correct way)
# #             cpu = p.cpu_percent(interval=0.1)

# #             memory = p.info['memory_info'].rss // (1024 * 1024)

# #             # Skip very low usage processes (clean output)
# #             # if cpu == 0:
# #             #     continue

# #             process_list.append({
# #                 "pid": p.info['pid'],
# #                 "name": name,
# #                 "cpu": cpu,
# #                 "memory": memory
# #             })

# #         except:
# #             pass

# #     # 🔥 Sort by CPU (highest first)
# #     process_list = sorted(process_list, key=lambda x: x['cpu'], reverse=True)

# #     # 🔥 Show only top 10 processes
# #     return process_list[:10]
# import psutil
# from collections import defaultdict

# def get_processes():
#     grouped = defaultdict(lambda: {
#         "name": "",
#         "count": 0,
#         "cpu": 0,
#         "memory": 0
#     })

#     for p in psutil.process_iter(['name', 'memory_info']):
#         try:
#             name = p.info['name']

#             if not name:
#                 continue

#             cpu = p.cpu_percent(interval=0.1)
#             memory = p.info['memory_info'].rss // (1024 * 1024)

#             # 🔥 Normalize names (important)
#             lower_name = name.lower()

#             if "chrome" in lower_name:
#                 app_name = "Chrome"
#             elif "code" in lower_name:
#                 app_name = "VS Code"
#             elif "whatsapp" in lower_name:
#                 app_name = "WhatsApp"
#             elif "edge" in lower_name:
#                 app_name = "Edge"
#             else:
#                 app_name = name  # keep original

#             # 🔥 Grouping logic
#             grouped[app_name]["name"] = app_name
#             grouped[app_name]["count"] += 1
#             grouped[app_name]["cpu"] += cpu
#             grouped[app_name]["memory"] += memory

#         except:
#             pass

#     # 🔥 Convert to list
#     result = []
#     for app in grouped.values():
#         result.append({
#             "name": f"{app['name']} ({app['count']})",
#             "cpu": round(app["cpu"], 1),
#             "memory": app["memory"]
#         })

#     # 🔥 Sort like Task Manager (by memory)
#     result = sorted(result, key=lambda x: x['memory'], reverse=True)

#     return result[:10]
import psutil
import time
import requests
import threading
from datetime import datetime
import pygetwindow as gw

# Same concept as your Chrome extension
# activeTab = which website you are on
# Here: active_app = which desktop app is in foreground
active_app = None
start_time = None
is_idle = False

# How long between saves (30 seconds just like extension)
SAVE_INTERVAL = 30

# Your Express backend URL - same backend, same database
BACKEND_URL = "http://localhost:8000/activity"

def get_active_window():
    """
    Gets the name of the app currently in the foreground
    This is the desktop equivalent of tab.active in Chrome
    """
    try:
        # Get the window title that is currently focused
        window = gw.getActiveWindow()
        if window is None:
            return None
            
        title = window.title
        
        # Normalize app names
        # Same idea as your teammate's grouping logic
        title_lower = title.lower()
        
        if "chrome" in title_lower:
            return "Chrome"
        elif "code" in title_lower:
            return "VS Code"
        elif "whatsapp" in title_lower:
            return "WhatsApp"
        elif "spotify" in title_lower:
            return "Spotify"
        elif "discord" in title_lower:
            return "Discord"
        elif "postman" in title_lower:
            return "Postman"
        elif title == "" or title is None:
            return None
        else:
            return title
            
    except Exception as e:
        print(f"Window detection error: {e}")
        return None

def save_session(app_name, duration_seconds):
    """
    Sends duration data to your Express backend
    Same as the fetch() call in your background.js
    """
    if not app_name or duration_seconds < 2:
        return
        
    try:
        # This is the Python equivalent of fetch() in JavaScript
        response = requests.post(BACKEND_URL, json={
            "url": f"app://{app_name}",  # prefix with app:// so you can
                                          # tell desktop apps from websites
                                          # in your dashboard later
            "duration_seconds": duration_seconds,
            "timestamp": datetime.now().isoformat(),
            "type": "desktop"            # new type for desktop apps
        })
        print(f"Saved: {app_name} → {duration_seconds}s")
        
    except Exception as e:
        print(f"Failed to save session: {e}")

def track_active_window():
    """
    This is the main tracking loop
    Runs forever in the background
    Same as setInterval in your Chrome extension
    """
    global active_app, start_time
    
    print("Desktop tracker started...")
    
    while True:
        current_app = get_active_window()
        
        # Case 1: User switched to a different app
        # Same as chrome.tabs.onActivated in your extension
        if current_app != active_app:
            
            # Save the previous app's session first
            if active_app and start_time:
                duration = round(time.time() - start_time)
                save_session(active_app, duration)
            
            # Start tracking the new app
            active_app = current_app
            start_time = time.time()
            
            if current_app:
                print(f"Switched to: {current_app}")
        
        # Case 2: Same app still active
        # Save every 30 seconds just like your extension
        # This handles the case where user never switches apps
        elif active_app and start_time:
            duration = round(time.time() - start_time)
            
            if duration >= SAVE_INTERVAL:
                save_session(active_app, duration)
                # Reset timer but stay on same app
                # Same as startTime = Date.now() in extension
                start_time = time.time()
        
        # Check every 1 second for app switches
        # Fine grained enough to catch quick switches
        time.sleep(1)

def get_current_desktop_session():
    """Returns the app currently being tracked and for how long"""
    if active_app and start_time:
        duration_seconds = round(time.time() - start_time)
        return {
            "name": active_app,
            "minutes": round(duration_seconds / 60, 1),
            "seconds": duration_seconds
        }
    return None

def get_processes():
    """
    Your teammate's original function - kept for the /processes route
    Shows current snapshot - useful for debugging
    """
    from collections import defaultdict
    
    grouped = defaultdict(lambda: {
        "name": "",
        "count": 0,
        "cpu": 0,
        "memory": 0
    })

    for p in psutil.process_iter(['name', 'memory_info']):
        try:
            name = p.info['name']
            if not name:
                continue

            cpu = p.cpu_percent(interval=0.1)
            memory = p.info['memory_info'].rss // (1024 * 1024)
            lower_name = name.lower()

            if "chrome" in lower_name:
                app_name = "Chrome"
            elif "code" in lower_name:
                app_name = "VS Code"
            elif "whatsapp" in lower_name:
                app_name = "WhatsApp"
            elif "edge" in lower_name:
                app_name = "Edge"
            else:
                app_name = name

            grouped[app_name]["name"] = app_name
            grouped[app_name]["count"] += 1
            grouped[app_name]["cpu"] += cpu
            grouped[app_name]["memory"] += memory

        except:
            pass

    result = []
    for app in grouped.values():
        result.append({
            "name": f"{app['name']} ({app['count']})",
            "cpu": round(app["cpu"], 1),
            "memory": app["memory"]
        })

    result = sorted(result, key=lambda x: x['memory'], reverse=True)
    return result[:10]

# Start the tracker in a background thread
# threading means it runs alongside Flask
# without blocking the web server
# Same concept as how background.js runs
# alongside your normal Chrome browsing
tracker_thread = threading.Thread(
    target=track_active_window,
    daemon=True  # stops automatically when main program stops
)
tracker_thread.start()