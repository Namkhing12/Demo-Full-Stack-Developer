export interface NormalizedLog {
    timestamp: Date;
    tenant: string;
    source: string; // firewall | crowdstrike | aws | m365 | ad | api | net
    vendor?: string;
    product?: string;
    event_type?: string;
    event_subtype?: string;
    severity: number; // 0-10
    action?: string; // allow | deny | create | delete | login | logout
    src_ip?: string;
    dst_ip?: string;
    src_port?: number;
    dst_port?: number;
    protocol?: string;
    user?: string;
    host?: string;
    process?: string;
    url?: string;
    http_method?: string;
    status_code?: number;
    rule_name?: string;
    rule_id?: string;
    cloud?: any;
    raw: any;
    tags?: string[];
}
