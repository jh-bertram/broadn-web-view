# Audit Report — Task [TASK_ID]

**Auditor:** code-auditor
**Date:** [ISO-8601]
**Files in Scope:** [list changed files]
**Trigger:** [completion_packet | ui_packet | data_packet]
**Attempt:** [1 | 2 | 3]

---

## Standards Check (SA)

```xml
<audit_review>
  <target_file>[path]</target_file>
  <status>[PASS | FAIL]</status>
  <violations>
    <!-- populated only on FAIL -->
    <issue line="[num]">
      <rule>[rule ID from standards.md]</rule>
      <severity>[CRITICAL | STYLE]</severity>
      <description>[what the code does vs. what the standard requires]</description>
      <remediation>[specific, actionable fix]</remediation>
    </issue>
  </violations>
</audit_review>
```

**SA Result:** [PASS | FAIL]
*If FAIL, stop here. Return remediation_request to implementing agent.*

---

## Functional Tests (QA)

```xml
<test_report>
  <task_id>[ID]</task_id>
  <status>[PASS | FAIL]</status>
  <test_coverage>[unit | integration | e2e] [X passed, Y failed]</test_coverage>
  <defects>
    <!-- populated only on FAIL -->
    <bug>
      <description>[observed behavior vs. expected behavior]</description>
      <steps_to_reproduce>[exact commands or inputs]</steps_to_reproduce>
      <severity>[BLOCKER | MINOR]</severity>
    </bug>
  </defects>
</test_report>
```

**QA Result:** [PASS | FAIL]
*If FAIL, stop here. Return remediation_request to implementing agent.*

---

## Security Scan (SX)

```xml
<security_audit>
  <status>[SECURE | VULNERABLE]</status>
  <threat_level>[CRITICAL | HIGH | MEDIUM | LOW | NONE]</threat_level>
  <findings>
    <!-- populated only on VULNERABLE -->
    <vulnerability>
      <type>[OWASP category]</type>
      <location>[file:line]</location>
      <description>[exploit potential in context of this codebase]</description>
      <mitigation>[specific code change required]</mitigation>
      <severity>[CRITICAL | HIGH | MEDIUM | LOW]</severity>
      <owasp_ref>[A0X — category name]</owasp_ref>
    </vulnerability>
  </findings>
</security_audit>
```

**SX Result:** [SECURE | VULNERABLE]

---

## Final Verdict

| Check | Result |
|---|---|
| Standards (SA) | [PASS / FAIL] |
| Functional Tests (QA) | [PASS / FAIL] |
| Security Scan (SX) | [SECURE / VULNERABLE] |
| **Overall** | **[APPROVED / REJECTED]** |

**Next action:** [APPROVED → spawn archivist | REJECTED → remediation_request to [agent-name]]
