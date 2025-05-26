interface IntentMapping {
  patterns: RegExp[];
  tool: string;
  extractParams: (text: string) => any;
}

const intentMappings: IntentMapping[] = [
  // Host operations
  {
    patterns: [
      /list\s+(all\s+)?hosts?/i,
      /show\s+(me\s+)?(all\s+)?hosts?/i,
      /get\s+(all\s+)?hosts?/i,
      /what\s+hosts?\s+do\s+(i|we)\s+have/i
    ],
    tool: 'foreman_list_hosts',
    extractParams: (text: string) => {
      const params: any = {};
      
      // Extract organization
      const orgMatch = text.match(/(?:in|for)\s+(?:org(?:anization)?\s+)?(\w+)/i);
      if (orgMatch) params.organization_id = orgMatch[1];
      
      // Extract search terms
      const searchMatch = text.match(/(?:named?|called?|with\s+name)\s+['""]?(\w+)['""]?/i);
      if (searchMatch) params.search = `name ~ ${searchMatch[1]}`;
      
      return params;
    }
  },
  {
    patterns: [
      /(?:show|get|display)\s+(?:details?\s+)?(?:for\s+)?host\s+['""]?(\S+)['""]?/i,
      /what\s+is\s+the\s+status\s+of\s+host\s+['""]?(\S+)['""]?/i,
      /tell\s+me\s+about\s+host\s+['""]?(\S+)['""]?/i
    ],
    tool: 'foreman_get_host',
    extractParams: (text: string) => {
      const match = text.match(/host\s+['""]?(\S+)['""]?/i);
      return match ? { id: match[1] } : {};
    }
  },
  {
    patterns: [
      /create\s+(?:a\s+)?(?:new\s+)?host/i,
      /add\s+(?:a\s+)?(?:new\s+)?host/i,
      /provision\s+(?:a\s+)?(?:new\s+)?host/i
    ],
    tool: 'foreman_create_host',
    extractParams: (text: string) => {
      const params: any = {};
      
      // Extract host name
      const nameMatch = text.match(/(?:named?|called?)\s+['""]?(\S+)['""]?/i);
      if (nameMatch) params.name = nameMatch[1];
      
      // Extract organization
      const orgMatch = text.match(/(?:in|for)\s+org(?:anization)?\s+['""]?(\S+)['""]?/i);
      if (orgMatch) params.organization_id = orgMatch[1];
      
      // Extract location
      const locMatch = text.match(/(?:in|at)\s+location\s+['""]?(\S+)['""]?/i);
      if (locMatch) params.location_id = locMatch[1];
      
      // Extract IP
      const ipMatch = text.match(/(?:with\s+)?ip\s+(?:address\s+)?(\d+\.\d+\.\d+\.\d+)/i);
      if (ipMatch) params.ip = ipMatch[1];
      
      return params;
    }
  },
  {
    patterns: [
      /(?:delete|remove|destroy)\s+host\s+['""]?(\S+)['""]?/i,
      /get\s+rid\s+of\s+host\s+['""]?(\S+)['""]?/i
    ],
    tool: 'foreman_delete_host',
    extractParams: (text: string) => {
      const match = text.match(/host\s+['""]?(\S+)['""]?/i);
      return match ? { id: match[1] } : {};
    }
  },
  {
    patterns: [
      /(?:power|turn)\s+(on|off|start|stop|reboot|restart)\s+host\s+['""]?(\S+)['""]?/i,
      /(?:reboot|restart|shutdown)\s+host\s+['""]?(\S+)['""]?/i,
      /host\s+['""]?(\S+)['""]?\s+(?:power|turn)\s+(on|off|start|stop)/i
    ],
    tool: 'foreman_power_host',
    extractParams: (text: string) => {
      const params: any = {};
      
      // Extract host name
      const hostMatch = text.match(/host\s+['""]?(\S+)['""]?/i);
      if (hostMatch) params.id = hostMatch[1];
      
      // Extract power action
      if (/(?:power|turn)\s+on|start/i.test(text)) params.action = 'start';
      else if (/(?:power|turn)\s+off|shutdown/i.test(text)) params.action = 'poweroff';
      else if (/stop/i.test(text)) params.action = 'stop';
      else if (/reboot|restart/i.test(text)) params.action = 'reboot';
      
      return params;
    }
  },
  // Content View operations
  {
    patterns: [
      /list\s+(?:all\s+)?content\s+views?/i,
      /show\s+(?:me\s+)?(?:all\s+)?content\s+views?/i,
      /what\s+content\s+views?\s+do\s+(?:i|we)\s+have/i
    ],
    tool: 'foreman_list_content_views',
    extractParams: (text: string) => {
      const params: any = {};
      
      // Extract organization
      const orgMatch = text.match(/(?:in|for)\s+org(?:anization)?\s+['""]?(\S+)['""]?/i);
      if (orgMatch) params.organization_id = orgMatch[1];
      
      return params;
    }
  },
  {
    patterns: [
      /publish\s+content\s+view\s+['""]?(\S+)['""]?/i,
      /create\s+(?:a\s+)?new\s+version\s+of\s+content\s+view\s+['""]?(\S+)['""]?/i
    ],
    tool: 'foreman_publish_content_view',
    extractParams: (text: string) => {
      const match = text.match(/content\s+view\s+['""]?(\S+)['""]?/i);
      const params: any = match ? { id: match[1] } : {};
      
      // Extract description
      const descMatch = text.match(/(?:with\s+)?description\s+['""](.+?)['""]?$/i);
      if (descMatch) params.description = descMatch[1];
      
      return params;
    }
  },
  // Repository operations
  {
    patterns: [
      /sync(?:hronize)?\s+repo(?:sitory)?\s+['""]?(\S+)['""]?/i,
      /update\s+repo(?:sitory)?\s+['""]?(\S+)['""]?/i
    ],
    tool: 'foreman_sync_repository',
    extractParams: (text: string) => {
      const match = text.match(/repo(?:sitory)?\s+['""]?(\S+)['""]?/i);
      return match ? { id: match[1] } : {};
    }
  },
  {
    patterns: [
      /list\s+(?:all\s+)?repo(?:sitorie)?s/i,
      /show\s+(?:me\s+)?(?:all\s+)?repo(?:sitorie)?s/i,
      /what\s+repo(?:sitorie)?s\s+do\s+(?:i|we)\s+have/i
    ],
    tool: 'foreman_list_repositories',
    extractParams: (text: string) => {
      const params: any = {};
      
      // Extract content type
      if (/yum/i.test(text)) params.content_type = 'yum';
      else if (/docker/i.test(text)) params.content_type = 'docker';
      else if (/deb/i.test(text)) params.content_type = 'deb';
      
      return params;
    }
  },
  // Task operations
  {
    patterns: [
      /(?:list|show)\s+(?:running\s+)?tasks?/i,
      /what\s+tasks?\s+are\s+running/i,
      /show\s+(?:me\s+)?(?:all\s+)?(?:running\s+)?tasks?/i
    ],
    tool: 'foreman_list_tasks',
    extractParams: (text: string) => {
      const params: any = {};
      
      // Extract state
      if (/running/i.test(text)) params.state = 'running';
      else if (/stopped/i.test(text)) params.state = 'stopped';
      else if (/paused/i.test(text)) params.state = 'paused';
      
      // Extract result
      if (/error|failed/i.test(text)) params.result = 'error';
      else if (/success/i.test(text)) params.result = 'success';
      
      return params;
    }
  },
  // Organization operations
  {
    patterns: [
      /list\s+(?:all\s+)?org(?:anization)?s/i,
      /show\s+(?:me\s+)?(?:all\s+)?org(?:anization)?s/i,
      /what\s+org(?:anization)?s\s+do\s+(?:i|we)\s+have/i
    ],
    tool: 'foreman_list_organizations',
    extractParams: () => ({})
  },
  {
    patterns: [
      /create\s+(?:a\s+)?(?:new\s+)?org(?:anization)?/i,
      /add\s+(?:a\s+)?(?:new\s+)?org(?:anization)?/i
    ],
    tool: 'foreman_create_organization',
    extractParams: (text: string) => {
      const params: any = {};
      
      // Extract name
      const nameMatch = text.match(/(?:named?|called?)\s+['""]?(.+?)['""]?(?:\s+with|\s*$)/i);
      if (nameMatch) params.name = nameMatch[1].trim();
      
      // Extract description
      const descMatch = text.match(/(?:with\s+)?description\s+['""](.+?)['""]?$/i);
      if (descMatch) params.description = descMatch[1];
      
      return params;
    }
  }
];

export function parseNaturalLanguage(text: string): { tool: string; params: any } | null {
  for (const mapping of intentMappings) {
    for (const pattern of mapping.patterns) {
      if (pattern.test(text)) {
        return {
          tool: mapping.tool,
          params: mapping.extractParams(text)
        };
      }
    }
  }
  
  return null;
}

export function suggestAlternatives(text: string): string[] {
  const suggestions: string[] = [];
  
  // Host-related suggestions
  if (/host/i.test(text)) {
    suggestions.push(
      'list all hosts',
      'show host <hostname>',
      'create host named <name> in organization <org>',
      'delete host <hostname>',
      'reboot host <hostname>'
    );
  }
  
  // Content view suggestions
  if (/content|view/i.test(text)) {
    suggestions.push(
      'list content views',
      'publish content view <name>',
      'show content view <name>'
    );
  }
  
  // Repository suggestions
  if (/repo/i.test(text)) {
    suggestions.push(
      'list repositories',
      'sync repository <name>',
      'create repository named <name>'
    );
  }
  
  // Task suggestions
  if (/task|job/i.test(text)) {
    suggestions.push(
      'list running tasks',
      'show failed tasks',
      'list all tasks'
    );
  }
  
  // General suggestions if no specific context
  if (suggestions.length === 0) {
    suggestions.push(
      'list all hosts',
      'list organizations',
      'list content views',
      'list running tasks'
    );
  }
  
  return suggestions;
}