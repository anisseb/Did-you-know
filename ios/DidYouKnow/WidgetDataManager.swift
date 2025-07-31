import Foundation
import WidgetKit

@objc(WidgetDataManager)
class WidgetDataManager: NSObject {
  
  private let appGroup = "group.com.anisse3000.didyouknow"
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func updateWidgetData(_ jsonString: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    guard let sharedDefaults = UserDefaults(suiteName: appGroup) else {
      rejecter("ERROR", "Cannot access shared UserDefaults", nil)
      return
    }
    
    guard let data = jsonString.data(using: .utf8) else {
      rejecter("ERROR", "Invalid JSON string", nil)
      return
    }
    
    sharedDefaults.set(data, forKey: "anecdotes_cache")
    sharedDefaults.synchronize()
    
    // Recharger tous les widgets
    WidgetCenter.shared.reloadAllTimelines()
    
    resolver(true)
  }
  
  @objc
  func updateWidgetConfiguration(_ jsonString: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    guard let sharedDefaults = UserDefaults(suiteName: appGroup) else {
      rejecter("ERROR", "Cannot access shared UserDefaults", nil)
      return
    }
    
    guard let data = jsonString.data(using: .utf8) else {
      rejecter("ERROR", "Invalid JSON string", nil)
      return
    }
    
    sharedDefaults.set(data, forKey: "widget_configuration")
    sharedDefaults.synchronize()
    
    // Recharger tous les widgets
    WidgetCenter.shared.reloadAllTimelines()
    
    resolver(true)
  }
  
  @objc
  func getWidgetConfiguration(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    guard let sharedDefaults = UserDefaults(suiteName: appGroup) else {
      rejecter("ERROR", "Cannot access shared UserDefaults", nil)
      return
    }
    
    guard let data = sharedDefaults.data(forKey: "widget_configuration") else {
      resolver(NSNull())
      return
    }
    
    guard let jsonString = String(data: data, encoding: .utf8) else {
      rejecter("ERROR", "Cannot convert data to string", nil)
      return
    }
    
    resolver(jsonString)
  }
}